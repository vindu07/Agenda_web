/*IMPORTA FUNZIONI DI FIRESTORE FIREBASE*/
import { 
  getFirestore, collection, addDoc, getDocs, 
  doc, getDoc, updateDoc, deleteDoc, 
  query, where, orderBy 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const db = getFirestore(); // già inizializzato col tuo app
const tasksRef = collection(db, "tasks");


/*CREA TASK*/
export async function createTask(task) {
  // Trasforma l'array in oggetto
  const task = {
    ID: task[0],
    scadenza: task[1],
    materia: task[2],
    isTest: task[3],
    priority: task[4],
    desc: task[5],
    isCompleted: task[6]
  };

  // Salva in Firestore
  const docRef = await addDoc(tasksRef, task);
  console.log("Task salvato con ID:", docRef.id);
  return docRef.id;
}
async function editTask(ID, task){}
async function deleteTask(ID){}

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
    renderTasks(tasks);

  } catch (err) {
    console.error("Errore nel caricamento dei task:", err);
  }
}







function editTask(ID, task){}
function deleteTask(ID){}
function sortTaskByDate(first_date, last_date){}
function sortTaskBySubject(subject){}


function saveTasks(){}
function getTasks(){}
