import { getDatabase, ref, get } from "firebase/database";
import app from "./firebase";


const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

export async function getRecentItemsWithGeohashNotGov(targetGeohash: string) {
  const db = getDatabase(app);
  const snapshot = await get(ref(db, "/disasters"));

  if (!snapshot.exists()) {
    return [];
  }

  const disasterData = snapshot.val();
  const now = Math.floor(Date.now() / 1000);
  const oneWeekAgo = now - ONE_WEEK_SECONDS;

  const results: any[] = [];

  Object.keys(disasterData).forEach((uniqueId) => {
    const [geohash, timestampStr] = uniqueId.split("_");
    const timestamp = parseFloat(timestampStr);

    console.log("Checking:", uniqueId, "→", geohash, timestamp);

    if (!geohash.startsWith(targetGeohash)) {
      console.log(`❌ Geohash "${geohash}" does not start with target "${targetGeohash}"`);
    } else if (isNaN(timestamp)) {
      console.log(`❌ Timestamp "${timestampStr}" is not a valid number`);
    } else if (timestamp < oneWeekAgo) {
      console.log(`❌ Timestamp ${timestamp} is older than one week ago (${oneWeekAgo})`);
    } else {
      const dataForKey = disasterData[uniqueId];
      if (dataForKey) {
        // Remove specific unwanted keys from the data object
        const keysToRemove = ["gdac_disasters", "cnn_analysis", "weather_data"];
        const filteredData = { ...dataForKey };
        keysToRemove.forEach(key => {
          if (key in filteredData) {
            delete filteredData[key];
          }
        });

        results.push({ uniqueId, data: filteredData });
      } else {
        console.log(`❌ No data found for ${uniqueId}`);
      }
    }
  });

  return results;
}

export async function getItemsFirebase() {
  const db = getDatabase(app);
  const snapshot = await get(ref(db, "/disasters"));

  if (!snapshot.exists()) {
    return [];
  }

  const disasterData = snapshot.val();
  const results: any[] = [];

  Object.entries(disasterData).forEach(([uniqueId, data]: [string, any]) => {
    const keysToRemove = ["gdac_disasters", "cnn_analysis", "weather_data"];
    const filteredData = { ...data };
    keysToRemove.forEach((key) => {
      delete filteredData[key];
    });
    results.push({ uniqueId, data: filteredData });
  });

  return results;
}

