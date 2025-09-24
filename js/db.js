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
  query, where, orderBy 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const db = getFirestore(app); // già inizializzato col tuo app
const tasksRef = collection(db, "tasks");


import * as Tasks from "./tasks.js";
import { pagDiario } from "./diary.js";


/*CREA TASK*/
async function createTask(task) {
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
async function editTask(ID, task){}
async function deleteTask(ID){}

/*LEGGE I RECORD E LI MANDA AL RENDERER*/
async function loadTasks() {
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








/*function editTask(ID, task){}
function deleteTask(ID){}
function sortTaskByDate(first_date, last_date){}
function sortTaskBySubject(subject){}


function saveTasks(){}
function getTasks(){}
*/
