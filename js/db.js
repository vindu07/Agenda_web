import * as Tasks from "./tasks.js";
import { pagDiario } from "./diary.js";


/*IMPORTA FUNZIONI DI FIRESTORE FIREBASE*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
const firebaseConfig = {
    apiKey: "AIzaSyBrc58aNKEHfGueKron2D87g3tlAWWqBlU",
    authDomain: "agenda-pwa-b5bb0.firebaseapp.com",
    projectId: "agenda-pwa-b5bb0",
    storageBucket: "agenda-pwa-b5bb0.firebasestorage.app",
    messagingSenderId: "211012466659",
    appId: "1:211012466659:web:feaf2be83c99a55ae5d2d6",
    measurementId: "G-5V4TVEFWEC"
  };
const app = initializeApp(firebaseConfig);

import { 
  getFirestore, collection, addDoc, getDocs, 
  doc, getDoc, updateDoc, deleteDoc, 
  query, where, orderBy, Timestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const db = getFirestore(app); // già inizializzato col tuo app
const tasksRef = collection(db, "tasks");





/*CREA TASK*/
export async function createTask(task) {
  // Trasforma l'array in oggetto
  const task_obj = {
    
    scadenza: task[0],
    materia: task[1],
    isTest: task[2],
    priority: task[3],
    desc: task[4],
    isCompleted: task[5]
  };

  // Salva in Firestore
  const docRef = await addDoc(tasksRef, task_obj);
  console.log("Task salvato con ID:", docRef.id);
  alert("Compito salvato correttamente!");
  return docRef.id;
    //render
    loadTasks();
}


export async function editTask(ID, task){}


export async function deleteTask(id) {
  try {
    const ref = doc(db, "tasks", id); // puntatore al documento
    await deleteDoc(ref);             // elimina dal db
    console.log(`Task ${id} eliminata correttamente`);
  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
  }
}

/**
 * Carica i task da Firestore con filtri
 * @param {Object} options - Opzioni di filtro/ordinamento
 * @param {string|null} options.materia
 * @param {string|null} options.dataInizio
 * @param {string|null} options.dataFine
 * @param {boolean|null} options.isTest
 * @param {boolean|null} options.isCompleted
 * @param {string|null} options.priority
 */
export async function sortTasks(options = {}) {
  try {
    let q = collection(db, "tasks");

    const conditions = [];

    // filtra per materia
    if (options.materia) {
      conditions.push(where("materia", "==", options.materia));
    }

    /// filtra per date
    if (options.dataInizio) {
      const startTS = options.dataInizio instanceof Timestamp 
        ? options.dataInizio 
        : Timestamp.fromDate(new Date(options.dataInizio));
      conditions.push(where("data", ">=", startTS));
    }
    if (options.dataFine) {
      const endTS = options.dataFine instanceof Timestamp
        ? options.dataFine
        : Timestamp.fromDate(new Date(options.dataFine));
      conditions.push(where("data", "<=", endTS));
    }

    // verifiche / compiti
    if (options.isTest !== null && options.isTest !== undefined) {
      conditions.push(where("isTest", "==", options.isTest));
    }

    // completati / non completati
    if (options.isCompleted !== null && options.isCompleted !== undefined) {
      conditions.push(where("isCompleted", "==", options.isCompleted));
    }

    // costruisco la query con where multipli
    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }

    const querySnapshot = await getDocs(q);

    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return tasks.sort((a, b) => {
    // 1️⃣ Verifiche prima di tutto
    if (a.isTest !== b.isTest) {
      return a.isTest ? -1 : 1; // se a è verifica, viene prima
    }

    // 2️⃣ Compiti non completati prima dei completati
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1; // se a è completato, viene dopo
    }

    // 3️⃣ Priorità (3 alta, 1 bassa) solo se non completati
    if (!a.isCompleted && !b.isCompleted) {
      return b.priority - a.priority; 
    }

    // se non scatta nulla, mantieni ordine
      return 0;
  });
  } catch (err) {
    console.error("Errore nel caricamento dei task:", err);
    return [];
  }
}

/*LEGGE I RECORD E LI MANDA AL RENDERER*/
export async function loadTasks() {
  try {
    const snapshot = await getDocs(tasksRef);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,       // ID Firestore
      ...doc.data()     // tutti i campi del task
    }));

    console.log("Tasks caricati:", tasks);

    // Passa l'array a taskRender
    Tasks.renderTasks(tasks);

  } catch (err) {
    console.error("Errore nel caricamento dei task:", err);
  }
}


