import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

export const configured = !!firebaseConfig.projectId && !firebaseConfig.projectId.startsWith('PEGA');
export const db = configured ? getFirestore(initializeApp(firebaseConfig)) : null;
