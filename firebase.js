// --- MODE DETEKTIF (DEBUGGING) ---
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

console.log("1. Script firebase.js mulai dimuat...");

// Konfigurasi (PASTIKAN TIDAK ADA TYPO DI SINI)
const firebaseConfig = {
    apiKey: "AIzaSyA9Ofp0v-rc0Z8iK98APBXrA3mSA9K_5X0",
    authDomain: "sayang-ff5b2.firebaseapp.com",
    projectId: "sayang-ff5b2",
    storageBucket: "sayang-ff5b2.firebasestorage.app",
    messagingSenderId: "615657253892",
    appId: "1:615657253892:web:768e3a8690fa0547a69951"
};

// Inisialisasi
try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("2. Firebase berhasil di-init");
} catch (error) {
    console.error("FATAL: Gagal init Firebase", error);
    alert("Firebase Error: Cek Console");
}

// Elemen DOM
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

// Cek apakah elemen ketemu
if (!sendBtn || !msgInput) {
    console.error("FATAL: Tombol atau Input tidak ditemukan di HTML!");
}

// --- FUNGSI KIRIM (DENGAN LOG) ---
async function kirimPesan() {
    console.log("3. Tombol diklik / Fungsi dipanggil");
    
    const text = msgInput.value;
    console.log("4. Isi pesan yang mau dikirim:", text);

    if (text.trim() === "") {
        console.warn("BLOKIR: Pesan kosong, pengiriman dibatalkan.");
        return; 
    }

    // Ubah tombol biar user tau lagi loading
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = "⏳";
    sendBtn.disabled = true;

    try {
        console.log("5. Sedang menghubungi database...");
        
        // --- INI MOMEN KRUSIALNYA ---
        const docRef = await addDoc(collection(db, "messages"), {
            text: text,
            sender: "Aku", 
            createdAt: serverTimestamp() 
        });
        
        console.log("6. SUKSES! Pesan masuk dengan ID:", docRef.id);
        msgInput.value = ""; // Bersihkan input
    } catch (e) {
        console.error("7. ERROR SAAT KIRIM:", e);
        alert("Gagal kirim: " + e.message); // Munculkan popup error
    } finally {
        // Balikin tombol
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
        console.log("8. Proses selesai.");
    }
}

// Event Listener
sendBtn.addEventListener('click', kirimPesan);
msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') kirimPesan();
});

// --- LISTENER PESAN MASUK ---
const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
onSnapshot(q, (snapshot) => {
    console.log("9. Ada update data dari database. Jumlah pesan:", snapshot.size);
    
    if (snapshot.empty) {
        chatBox.innerHTML = '<div class="text-center text-white/50 text-xs py-10 italic">Belum ada pesan...<br>Klik tombol kamera 📸 di pojok kanan!</div>';
        return;
    }

    chatBox.innerHTML = ""; // Reset biar gak numpuk
    snapshot.forEach((doc) => {
        renderMessage(doc.data());
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}, (error) => {
    console.error("ERROR SNAPSHOT:", error);
});

// Render HTML
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

function escapeHtml(text) {
    if (!text) return text;
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}