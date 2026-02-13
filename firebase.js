// HAPUS BARIS PERTAMA YANG LAMA, PAKAI YANG INI SAJA:
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. KONFIGURASI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyA9Ofp0v-rc0Z8iK98APBXrA3mSA9K_5X0",
  authDomain: "sayang-ff5b2.firebaseapp.com",
  projectId: "sayang-ff5b2",
  storageBucket: "sayang-ff5b2.firebasestorage.app",
  messagingSenderId: "615657253892",
  appId: "1:615657253892:web:768e3a8690fa0547a69951"
};

// 3. Inisialisasi Aplikasi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Logic Aplikasi Chat
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

// --- A. Fungsi Kirim Pesan ---
async function kirimPesan() {
    const text = msgInput.value;
    
    if (text.trim() === "") return; 

    try {
        await addDoc(collection(db, "messages"), {
            text: text,
            sender: "Aku", 
            createdAt: serverTimestamp() 
        });
        msgInput.value = ""; 
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Gagal kirim pesan, cek koneksi internet!");
    }
}

// Event Listener tombol kirim
sendBtn.addEventListener('click', kirimPesan);

// Event Listener tombol Enter
msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') kirimPesan();
});

// --- B. Fungsi Dengerin Pesan Masuk (Realtime) ---
const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = ""; 
    
    if (snapshot.empty) {
        chatBox.innerHTML = '<div class="text-center text-white/50 text-xs py-10 italic">Belum ada pesan...<br>Klik tombol kamera 📸 di pojok kanan!</div>';
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        renderMessage(data);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
});

// --- C. Fungsi Render Tampilan Chat ---
function renderMessage(data) {
    const div = document.createElement('div');
    
    div.className = "flex justify-end animate__animated animate__fadeInUp animate__faster";
    
    div.innerHTML = `
        <div class="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-2xl rounded-tr-none border border-white/20 shadow-sm max-w-[80%] text-left">
            <p class="text-sm font-medium leading-relaxed">${escapeHtml(data.text)}</p>
        </div>
    `;
    
    chatBox.appendChild(div);
}

// Mencegah XSS
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}