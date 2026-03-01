import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function PoolDashboard() {
  const { getAuthHeader, API } = useAuth();

  const [activeDrivers, setActiveDrivers] = useState([]);
  const [absentDrivers, setAbsentDrivers] = useState([]);
  const [unknownDrivers, setUnknownDrivers] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString("id-ID"));

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API}/pool-dashboard`, {
        headers: getAuthHeader(),
      });
      setActiveDrivers(res.data.active || []);
      setAbsentDrivers(res.data.absent || []);
      setUnknownDrivers(res.data.unknown || []);
    } catch (error) {
      console.log("Menunggu backend siap, pakai data sementara...");
      setActiveDrivers([
        { id: 1, name: "Budi Santoso", plate: "B 1234 RJA", time: "06:15" },
        { id: 2, name: "Ahmad", plate: "B 5678 RJA", time: "06:30" },
      ]);
      setAbsentDrivers([{ id: 3, name: "Yanto", reason: "Sakit" }]);
      setUnknownDrivers([{ id: 4, name: "Deni", plate: "B 9999 RJA" }]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    const dataInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <div className="flex justify-between items-center p-6 bg-zinc-900 border-b-2 border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-amber-500 tracking-wider">
            RAJA COMMAND CENTER
          </h1>
          <p className="text-zinc-400 text-lg mt-1">
            Status Kehadiran Pool Operasional
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-mono font-bold text-sky-400 tracking-tighter">
            {time}
          </h2>
          <p className="text-zinc-400 text-lg mt-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 flex-grow">
        <div className="bg-zinc-900 rounded-xl border-t-4 border-emerald-500 p-4 shadow-lg">
          <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            ON-DUTY (AKTIF)
          </h3>
          <div className="space-y-3">
            {activeDrivers.map((d, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg border border-zinc-700"
              >
                <div>
                  <p className="font-bold text-lg text-white">{d.name}</p>
                  <p className="text-zinc-400 text-sm">{d.plate}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-mono font-bold">
                    {d.time}
                  </p>
                  <p className="text-xs text-zinc-500">First SIJ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border-t-4 border-zinc-500 p-4 shadow-lg">
          <h3 className="text-xl font-bold text-zinc-300 mb-4">
            IZIN / SAKIT / CUTI
          </h3>
          <div className="space-y-3">
            {absentDrivers.map((d, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-zinc-800/30 p-3 rounded-lg border border-zinc-800 opacity-70"
              >
                <p className="font-bold text-lg text-zinc-300">{d.name}</p>
                <span className="px-3 py-1 bg-zinc-700 rounded-full text-xs font-bold text-zinc-300">
                  {d.reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border-t-4 border-rose-500 p-4 shadow-lg">
          <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
            BELUM TERDETEKSI
          </h3>
          <div className="space-y-3">
            {unknownDrivers.map((d, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
              >
                <div>
                  <p className="font-bold text-lg text-rose-200">{d.name}</p>
                  <p className="text-rose-400/60 text-sm">{d.plate}</p>
                </div>
                <span className="px-3 py-1 bg-rose-500/20 rounded-full text-xs font-bold text-rose-400">
                  Cek Keberadaan
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-500 p-3 text-zinc-950 font-bold text-center text-xl overflow-hidden whitespace-nowrap">
        INFO: Tetap utamakan keselamatan kerja | Cek kondisi unit sebelum
        berangkat | Selalu gunakan seragam RAJA yang rapi selama jam
        operasional.
      </div>
    </div>
  );
}
