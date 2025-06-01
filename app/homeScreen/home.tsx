import { useAuth } from "@/contexts/authContext";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { db } from "../../firebase";

import type { DocumentData } from "firebase/firestore";
import Footer from "../../components/footer";
import TuteeCard from "./tuteeCard";
import TutorCard from "./tutorCard";

const HomeScreen = () => {
  const [userDoc, setUserDoc] = useState<DocumentData | null>(null);
  const [cardsCollection, setCardCollection] = useState<DocumentData[]>([]);
  const { userDocID, userRole } = useAuth();

  // retrieve collection path based on user's role
  const path =
    userRole === "tutor" ? "users/roles/tutors" : "users/roles/tutees";

  // retrieve collection path of user's opposite role
  const cardsPath =
    userRole === "tutor" ? "users/roles/tutees" : "users/roles/tutors";

  // retrieve user's document
  const docRef = doc(db, path, userDocID);

  // retrieve user's document snapshot
  // The doc.data() can later be used to retrieve specific fields
  const docSnapshot = async () => {
    const doc = await getDoc(docRef);
    if (doc.exists()) {
      setUserDoc(doc.data());
    } else {
      console.log("home: No such document!");
    }
  };

  docSnapshot();

  useEffect(() => {
    const q = query(collection(db, cardsPath), orderBy("name"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCardCollection(data);
    });
    return () => unsub(); // unsubscribe on unmount
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      {userRole === "tutor" ? (
        <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-1/4">
          <View className="flex-row w-11/12 items-center inset-y-6">
            <View className="w-20 h-20 bg-white items-center rounded-full">
              <Image
                source={require("../../assets/images/hatLogo.png")}
                className="h-20 w-20 rounded-full mt-1 p-2"
              />
            </View>
            <Text className="text-4xl w-4/5 pl-4 font-asap-bold color-white">
              {userDoc ? userDoc.name : "User"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-1/4">
          <View className="flex-row w-11/12 items-center inset-y-6">
            <View className="w-20 h-20 bg-white items-center rounded-full">
              <Image
                source={require("../../assets/images/hatLogo.png")}
                className="h-20 w-20 rounded-full mt-1 p-2"
              />
            </View>
            <Text className="text-4xl w-4/5 pl-4 color-darkBrown font-asap-bold">
              {userDoc ? userDoc.name : "User"}
            </Text>
          </View>
        </View>
      )}

      {/* Card display logic */}
      <View className="h-4/6 w-full items-center">
        <FlatList
          data={cardsCollection}
          keyExtractor={(item) => item.id}
          renderItem={
            userRole == "tutor"
              ? ({ item }) => <TuteeCard item={item} />
              : ({ item }) => <TutorCard item={item} />
          }
          className="m-6"
          ItemSeparatorComponent={() => <View className="h-6" />} // Adds vertical spacing
        />
      </View>

      {/* Footer */}
      {userRole && <Footer role={userRole} />}
    </View>
  );
};

export default HomeScreen;
