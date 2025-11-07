// Shared logic for HomeHub multi-page prototype
const HH = (function(){
  // Default data kl
  const DEFAULT_SERVICES = [
    { id: 's1', name: 'Aseo general (casa pequeña)', price: 25000, approxTime: '2 h' },
    { id: 's2', name: 'Aseo profundo', price: 45000, approxTime: '4 h' },
    { id: 's3', name: 'Limpieza de ventanas', price: 20000, approxTime: '1.5 h' },
    { id: 's4', name: 'Lavado de ropa y planchado', price: 30000, approxTime: '2.5 h' }
  ];
  const SAMPLE_WORKERS = [
    { id: 'w1', name: 'María Pérez' },
    { id: 'w2', name: 'Laura Gómez' },
    { id: 'w3', name: 'Ana Rodríguez' }
  ];

  function dbGet(k, fallback){ const v = localStorage.getItem(k); return v? JSON.parse(v): fallback; }
  function dbSet(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  if (!dbGet('hh_services')) dbSet('hh_services', DEFAULT_SERVICES);
  if (!dbGet('hh_workers')) dbSet('hh_workers', SAMPLE_WORKERS);
  if (!dbGet('hh_users')) dbSet('hh_users', []);
  if (!dbGet('hh_bookings')) dbSet('hh_bookings', []);

  // auth helper
  const Auth = {
    currentUser: function(){ return dbGet('hh_currentUser', null); },
    login: function(email, password){ const users = dbGet('hh_users', []); return users.find(u=>u.email===email && u.password===password) || null; },
    register: function(name, email, password){
      const users = dbGet('hh_users', []);
      if (users.some(u=>u.email===email)) return { error: 'Correo ya registrado' };
      const newU = { name, email, password, role: 'cliente' };
      users.push(newU); dbSet('hh_users', users); return { ok: true };
    },
    setSession: function(user){ dbSet('hh_currentUser', user); },
    logout: function(){ localStorage.removeItem('hh_currentUser'); window.location.href = 'index.html'; },
    requireLogin: function(){ if (!this.currentUser()){ window.location.href = 'index.html'; return false; } return true; }
  };

  // UI helpers used by pages
  const UI = {
    renderServicesGrid: function(container){
      const services = dbGet('hh_services', DEFAULT_SERVICES);
      container.innerHTML = '';
      services.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-6 rounded-xl shadow hover:shadow-lg bg-white';
        card.innerHTML = `
          <h3 class="text-lg font-semibold mb-1">${s.name}</h3>
          <div class="text-sm text-gray-600 mb-2">Tiempo aprox: ${s.approxTime}</div>
          <div class="font-bold mb-3">COP ${s.price.toLocaleString()}</div>
          <div class="flex gap-2">
            <button class="btn-request px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-green-400 text-white">Solicitar</button>
            <button class="btn-details px-3 py-2 rounded border">Detalles</button>
          </div>
        `;
        // request handler opens a lightweight UI for date/time/address
        card.querySelector('.btn-request').addEventListener('click', ()=>{
          const date = prompt('Fecha (YYYY-MM-DD)');
          const time = prompt('Hora (HH:MM)');
          const address = prompt('Dirección completa');
          if (!date || !time || !address) return alert('Completa fecha, hora y dirección.');
          const bookings = dbGet('hh_bookings', []);
          const workers = dbGet('hh_workers', SAMPLE_WORKERS);
          const assigned = workers[Math.floor(Math.random()*workers.length)];
          const current = Auth.currentUser();
          if (!current){ alert('Debes iniciar sesión'); window.location.href='index.html'; return; }
          const newB = { id: 'b_'+Date.now(), userId: current.email, serviceId: s.id, date, time, address, status: 'CREADA', worker: assigned, messages: [], rating: null };
          bookings.push(newB); dbSet('hh_bookings', bookings); alert('Reserva creada. Personal asignado: '+assigned.name);
        });
        container.appendChild(card);
      });
    },
    renderBookings: function(container){
      const bookings = dbGet('hh_bookings', []);
      const current = Auth.currentUser();
      container.innerHTML = '';
      if (!current) { container.innerHTML = '<div class="text-sm text-gray-500">Inicia sesión para ver tus reservas.</div>'; return; }
      const mine = bookings.filter(b=>b.userId===current.email);
      if (mine.length===0){ container.innerHTML = '<div class="text-sm text-gray-500">No tienes reservas.</div>'; return; }
      mine.forEach(b=>{
        const svc = dbGet('hh_services').find(s=>s.id===b.serviceId) || {name:'Servicio'};
        const el = document.createElement('div');
        el.className = 'p-4 bg-white rounded-lg shadow flex justify-between items-start';
        el.innerHTML = `
          <div>
            <div class="font-semibold">${svc.name}</div>
            <div class="text-xs text-gray-600">${b.date} ${b.time} • ${b.address}</div>
            <div class="text-xs text-gray-700 mt-1">Personal: ${b.worker.name}</div>
            <div class="text-xs mt-1">Estado: <strong>${b.status}</strong></div>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <button class="chat-btn px-3 py-1 rounded border" data-id="${b.id}">Chat</button>
            ${b.status==='COMPLETADA' && !b.rating? `<button class="rate-btn px-3 py-1 rounded bg-yellow-400" data-id="${b.id}">Calificar</button>` : ''}
          </div>
        `;
        container.appendChild(el);
      });
      // bind chat and rating
      container.querySelectorAll('.chat-btn').forEach(btn=> btn.addEventListener('click', (e)=>{ const id=e.target.dataset.id; window.openChat(id); }));
      container.querySelectorAll('.rate-btn').forEach(btn=> btn.addEventListener('click', (e)=>{ const id=e.target.dataset.id; window.openRating(id); }));
    }
  };

  // expose some functions for pages to call (e.g., openChat)
  let openedChatBooking = null;
  return {
    Auth, UI,
    // shortcuts expected by pages
    HHAuth: Auth,
    HHUI: UI,
    // chat and rating controllers used by reservas.html
    openChat: function(bookingId){
      const bookings = dbGet('hh_bookings', []);
      const b = bookings.find(x=>x.id===bookingId);
      if (!b) return alert('Reserva no encontrada');
      openedChatBooking = b.id;
      // show modal elements (pages will implement UI)
      if (typeof window.showChatModal === 'function') window.showChatModal(b);
    },
    sendChatMessage: function(text){
      if (!openedChatBooking) return;
      const bookings = dbGet('hh_bookings', []);
      const b = bookings.find(x=>x.id===openedChatBooking);
      if (!b) return;
      const current = Auth.currentUser();
      const msg = { from: current.name, text, ts: Date.now() };
      b.messages.push(msg); dbSet('hh_bookings', bookings);
      // simulate worker reply
      setTimeout(()=>{
        const reply = { from: b.worker.name, text: 'Gracias, lo tengo en cuenta. Nos vemos el día del servicio.', ts: Date.now() };
        b.messages.push(reply); dbSet('hh_bookings', bookings);
        if (typeof window.onChatUpdated === 'function') window.onChatUpdated(b.messages);
      }, 900);
      if (typeof window.onChatUpdated === 'function') window.onChatUpdated(b.messages);
    },
    openRating: function(bookingId){ if (typeof window.showRatingModal === 'function') window.showRatingModal(bookingId); },
    submitRating: function(bookingId, score, comment){
      const bookings = dbGet('hh_bookings', []);
      const b = bookings.find(x=>x.id===bookingId); if (!b) return;
      b.rating = { score, comment }; dbSet('hh_bookings', bookings); alert('Gracias por tu valoración'); window.location.reload();
    },
    // developer helper to mark completed
    completarReserva: function(id){ const bookings = dbGet('hh_bookings', []); const b = bookings.find(x=>x.id===id); if (!b) return; b.status='COMPLETADA'; dbSet('hh_bookings', bookings); alert('Reserva marcada como COMPLETADA'); }
  };
})();

// expose friendly names for pages to use
const HHAuth = HH.HHAuth;
const HHUI = HH.HHUI;

// --------- index.html behaviors ---------
if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')){
  document.addEventListener('DOMContentLoaded', ()=>{
    const loginForm = document.getElementById('loginForm');
    const toggleMode = document.getElementById('toggleMode');
    let mode = 'login'; // or register
    const nameField = document.getElementById('nameField');
    const emailField = document.getElementById('emailField');
    const passwordField = document.getElementById('passwordField');
    const modeNote = document.getElementById('modeNote');
    // if session exists, redirect to servicios
    if (HHAuth.currentUser()){ window.location.href='servicios.html'; return; }

    toggleMode.addEventListener('click', ()=>{
      mode = mode==='login'?'register':'login';
      toggleMode.textContent = mode==='login'?'Registrar':'Iniciar';
      modeNote.innerHTML = mode==='login' ? '¿No tienes cuenta? Pulsa <strong>Registrar</strong>.' : 'Completa tu nombre para registrarte.';
      nameField.style.display = mode==='login' ? 'none' : 'block';
    });
    // initial hide nameField
    nameField.style.display = 'none';
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = emailField.value.trim();
      const pw = passwordField.value.trim();
      if (!email || !pw) return alert('Completa correo y contraseña');
      if (mode==='register'){
        const name = nameField.value.trim(); if (!name) return alert('Ingresa tu nombre');
        const r = HHAuth.register(name, email, pw);
        if (r && r.error) return alert(r.error);
        alert('Registro exitoso. Ahora inicia sesión.');
        mode = 'login'; toggleMode.textContent='Registrar'; nameField.style.display='none';
        nameField.value = '';
      } else {
        const user = HHAuth.login(email, pw);
        if (!user) return alert('Credenciales inválidas');
        HHAuth.setSession({ name: user.name, email: user.email });
        window.location.href = 'servicios.html';
      }
    });
  });
}

// --------- servicios.html behaviors ---------
if (location.pathname.endsWith('servicios.html')){
  window.addEventListener('DOMContentLoaded', ()=>{
    if (!HHAuth.requireLogin()) return;
    // header user and logout
    document.getElementById('userNameHeader').textContent = 'Hola, ' + HHAuth.currentUser().name;
    document.getElementById('logoutBtn').addEventListener('click', ()=> HHAuth.logout());
  });
}

// --------- reservas.html behaviors and modal controls ---------
if (location.pathname.endsWith('reservas.html')){
  window.addEventListener('DOMContentLoaded', ()=>{
    if (!HHAuth.requireLogin()) return;
    document.getElementById('userNameHeader').textContent = 'Hola, ' + HHAuth.currentUser().name;
    document.getElementById('logoutBtn').addEventListener('click', ()=> HHAuth.logout());
    HHUI.renderBookings(document.getElementById('myBookings'));

    // chat modal plumbing
    const chatModal = document.getElementById('chatModal');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatTitle = document.getElementById('chatTitle');
    const closeChat = document.getElementById('closeChat');

    window.showChatModal = function(booking){
      chatTitle.textContent = `Chat con ${booking.worker.name} (Reserva ${booking.id})`;
      chatModal.classList.remove('hidden');
      renderMessages(booking.messages);
      window.onChatUpdated = function(messages){ renderMessages(messages); };
    };
    window.onChatUpdated = null;
    function renderMessages(messages){
      chatMessages.innerHTML = '';
      messages.forEach(m => {
        const d = document.createElement('div');
        d.className = 'mb-3';
        d.innerHTML = `<div class="text-xs text-gray-600">${m.from} • ${new Date(m.ts).toLocaleString()}</div><div class="p-2 bg-white border rounded mt-1">${m.text}</div>`;
        chatMessages.appendChild(d);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    closeChat.addEventListener('click', ()=> chatModal.classList.add('hidden'));
    chatForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const text = chatInput.value.trim(); if (!text) return;
      HH.sendChatMessage(text);
      chatInput.value = '';
    });

    // rating modal
    const ratingModal = document.getElementById('ratingModal');
    const closeRating = document.getElementById('closeRating');
    const submitRating = document.getElementById('submitRating');
    let currentRatingBooking = null;
    window.showRatingModal = function(bookingId){
      currentRatingBooking = bookingId;
      ratingModal.classList.remove('hidden');
    };
    closeRating.addEventListener('click', ()=> ratingModal.classList.add('hidden'));
    submitRating.addEventListener('click', ()=>{
      const score = parseInt(document.getElementById('ratingSelect').value,10);
      const comment = document.getElementById('ratingComment').value.trim();
      if (!currentRatingBooking) return;
      HH.submitRating(currentRatingBooking, score, comment);
    });
  });
}
