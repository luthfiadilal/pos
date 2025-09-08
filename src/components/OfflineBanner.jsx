import { useContext } from "react";
import { OfflineContext } from "../contexts/OfflineContext";

export default function OfflineBanner() {
  const { isOnline } = useContext(OfflineContext);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-white p-2 text-center">
      Kamu sedang offline. Beberapa fitur mungkin tidak tersedia.
    </div>
  );
}
