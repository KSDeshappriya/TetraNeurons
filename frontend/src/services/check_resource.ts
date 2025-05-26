import { collection, getDocs, doc, updateDoc, deleteDoc,collectionGroup } from "firebase/firestore";
import app from "./firebase";
import { getFirestore } from "firebase/firestore";
export interface ResourceItem {
    id: string;
    type: 'shelter' | 'supply' | 'medical';
    name: string;
    description: string;
    longitude: number;
    latitude: number;
    distance?: number;
    status: string;
    hours: string;
    contact?: string;
    capacity: {
        total: number;
        available: number;
    };
}

export async function getResourcesByDisaster(disasterId: string): Promise<ResourceItem[]> {
    const db = getFirestore(app);
    const colRef = collection(db, "resources", disasterId, "items");
    const snapshot = await getDocs(colRef);

    const resources: ResourceItem[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();

        const {
            type,
            name = "",
            description = "",
            longitude = "0",
            latitude = "0",
            status = "unknown",
            hours = "",
            contact = "",
            totalCapacity = "0",
            availableCapacity = "0",
        } = data;

        if (["shelter", "supply", "medical"].includes(type)) {
            resources.push({
                id: doc.id,
                type,
                name,
                description,
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude),
                status,
                hours,
                contact,
                capacity: {
                    total: parseInt(totalCapacity),
                    available: parseInt(availableCapacity),
                },
            });
        }
    });

    return resources;
}

export async function updateResourceAvailableSpace(
    disasterId: string,
    resourceId: string,
    availabilityPercentage: number
): Promise<void> {
    const db = getFirestore(app);
    const resourceRef = doc(db, "resources", disasterId, "items", resourceId);

    // Get current resource data to calculate new available capacity
    const resources = await getResourcesByDisaster(disasterId);
    const resource = resources.find(r => r.id === resourceId);

    if (!resource) {
        throw new Error("Resource not found");
    }

    const newAvailableCapacity = Math.floor((resource.capacity.total * availabilityPercentage) / 100);

    await updateDoc(resourceRef, {
        availableCapacity: newAvailableCapacity.toString()
    });
}

export async function deleteResource(disasterId: string, resourceId: string): Promise<void> {
    const db = getFirestore(app);
    const resourceRef = doc(db, "resources", disasterId, "items", resourceId);
    await deleteDoc(resourceRef);
}

export async function getTotalResourceCount(): Promise<number> {
    const db = getFirestore(app);
    const snapshot = await getDocs(collectionGroup(db, "items"));
    return snapshot.size;
}