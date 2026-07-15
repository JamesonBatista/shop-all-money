import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAdbuGvdNBEA9aqD6V2IeBa1Q9uoETtEf4',
  authDomain: 'shop-all-money.firebaseapp.com',
  projectId: 'shop-all-money',
  storageBucket: 'shop-all-money.firebasestorage.app',
  messagingSenderId: '29067728914',
  appId: '1:29067728914:web:462af20c79acd33c7e60cb',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
