import { getDatabase, ref, get } from "firebase/database";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app from "./firebase";


interface DisasterData {
  ai_processing_time: number;
  citizen_survival_guide: string;
  created_at: number;
  disaster_id: string;
  emergency_type: string;
  geohash: string;
  government_report: string;
  image_url: string;
  latitude: number;
  longitude: number;
  people_count: string;
  situation: string;
  status: string;
  submitted_time: number;
  urgency_level: string;
  user_id: string;
}

interface User {
  created_at: string;
  email: string;
  geohash: string;
  last_location_update: string;
  latitude: number;
  longitude: number;
  name: string;
  phone: string;
  profile_image_url: string | null;
  role: "first_responder" | "volunteer" | "user" | "government";
  status: string;
  uid: string;
}

interface EmergencyContact {
  uid: string;
  name: string;
  phone: string;
  description: string;
  longitude: number;
  latitude: number;
  role: string;
}

export async function fetchDisasterData(
  disasterId: string | null,
  setDisasterData: (data: DisasterData | null) => void,
  setEmergencyContacts: (contacts: EmergencyContact[]) => void,
  setError: (err: string | null) => void,
  setLoading: (loading: boolean) => void,
) {
  if (!disasterId) {
    setError('No disaster ID provided');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const db = getDatabase(app);
    const disasterRef = ref(db, `/disasters/${disasterId}`);
    const snapshot = await get(disasterRef);

    if (!snapshot.exists()) {
      setError('Disaster not found');
      setLoading(false);
      return;
    }

    const disaster = snapshot.val() as DisasterData;
    setDisasterData(disaster);

    const geohashPrefix = disaster.geohash.substring(0, 4);

    const firestore = getFirestore(app);
    const usersCollection = collection(firestore, "users");

    const [volunteersSnapshot, firstRespondersSnapshot] = await Promise.all([
      getDocs(query(usersCollection, where("role", "==", "volunteer"))),
      getDocs(query(usersCollection, where("role", "==", "first_responder")))
    ]);

    const volunteers = volunteersSnapshot.docs
      .map(doc => doc.data() as User)
      .filter(user => user.geohash?.startsWith(geohashPrefix));

    const firstResponders = firstRespondersSnapshot.docs
      .map(doc => doc.data() as User)
      .filter(user => user.geohash?.startsWith(geohashPrefix));

    const contacts: EmergencyContact[] = [
      {
        uid: 'emergency-911',
        name: 'Emergency Services',
        phone: '911',
        description: 'Police, Fire, Medical Emergency',
        longitude: disaster.longitude,
        latitude: disaster.latitude,
        role: 'emergency',
      },
      ...volunteers.map(user => ({
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        description: `Volunteer - Available for assistance`,
        longitude: user.longitude,
        latitude: user.latitude,
        role: 'volunteer',
      })),
      ...firstResponders.map(user => ({
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        description: `First Responder - ${user.status}`,
        longitude: user.longitude,
        latitude: user.latitude,
        role: 'first_responder',
      })),
    ];

    setEmergencyContacts(contacts);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load disaster information');
    setLoading(false);
  }
}

export async function fetchALLDisasterData(
  disasterId: string | null,
  setDisasterData: (data: DisasterData | null) => void,
  setEmergencyContacts: (contacts: EmergencyContact[]) => void,
  setError: (err: string | null) => void,
  setLoading: (loading: boolean) => void,
) {
  if (!disasterId) {
    setError('No disaster ID provided');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const db = getDatabase(app);
    const disasterRef = ref(db, `/disasters/${disasterId}`);
    const snapshot = await get(disasterRef);

    if (!snapshot.exists()) {
      setError('Disaster not found');
      setLoading(false);
      return;
    }

    const disaster = snapshot.val() as DisasterData;
    setDisasterData(disaster);

    const geohashPrefix = disaster.geohash.substring(0, 4);

    const firestore = getFirestore(app);
    const usersCollection = collection(firestore, "users");

    const [volunteersSnapshot, firstRespondersSnapshot,userSnapshot] = await Promise.all([
      getDocs(query(usersCollection, where("role", "==", "volunteer"))),
      getDocs(query(usersCollection, where("role", "==", "first_responder"))),
      getDocs(query(usersCollection, where("role", "==", "user")))
    ]);

    const volunteers = volunteersSnapshot.docs
      .map(doc => doc.data() as User)
      .filter(user => user.geohash?.startsWith(geohashPrefix));

    const firstResponders = firstRespondersSnapshot.docs
      .map(doc => doc.data() as User)
      .filter(user => user.geohash?.startsWith(geohashPrefix));
    
    const users = userSnapshot.docs
      .map(doc => doc.data() as User)
      .filter(user => user.geohash?.startsWith(geohashPrefix));

    const contacts: EmergencyContact[] = [
      {
        uid: 'emergency-911',
        name: 'Emergency Services',
        phone: '911',
        description: 'Police, Fire, Medical Emergency',
        longitude: disaster.longitude,
        latitude: disaster.latitude,
        role: 'emergency',
      },
      ...volunteers.map(user => ({
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        description: `Volunteer - Available for assistance`,
        longitude: user.longitude,
        latitude: user.latitude,
        role: 'volunteer',
      })),
      ...firstResponders.map(user => ({
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        description: `First Responder - ${user.status}`,
        longitude: user.longitude,
        latitude: user.latitude,
        role: 'first_responder',
      })),
      ...users.map(user => ({
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        description: `User - ${user.status}`,
        longitude: user.longitude,
        latitude: user.latitude,
        role: 'user',
      })),
    ];

    setEmergencyContacts(contacts);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load disaster information');
    setLoading(false);
  }
}

export async function fetchDisasterDataWithoutContact(
  disasterId: string | null,
  setDisasterData: (data: DisasterData | null) => void,
  setError: (err: string | null) => void,
  setLoading: (loading: boolean) => void,
) {
  if (!disasterId) {
    setError('No disaster ID provided');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const db = getDatabase(app);
    const disasterRef = ref(db, `/disasters/${disasterId}`);
    const snapshot = await get(disasterRef);

    if (!snapshot.exists()) {
      setError('Disaster not found');
      setLoading(false);
      return;
    }

    const disaster = snapshot.val() as DisasterData;
    setDisasterData(disaster);
    
    setLoading(false);
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load disaster information');
    setLoading(false);
  }
}
