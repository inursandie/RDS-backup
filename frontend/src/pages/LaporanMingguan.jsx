import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Search,
  Calendar,
} from "lucide-react";

const PERIOD_LABELS = ["Periode 1", "Periode 2", "Periode 3", "Periode 4"];
const PERIOD_RANGES = ["1 - 7", "8 - 14", "15 - 21", "22 - Akhir"];
const LOW_KHD_THRESHOLD = 20;

function formatMonthISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(monthStr) {
  const [year, mon] = monthStr.split("-");
  const d = new Date(Number(year), Number(mon) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function DriverTable({ drivers, title, search }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase();
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.plate.toLowerCase().includes(q) ||
        d.driver_id.toLowerCase().includes(q),
    );
  }, [drivers, search]);

  if (drivers.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/40">
        <h3 className="text-sm font-bold text-amber-400">
          {title} ({drivers.length} driver)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-800/80 border-b border-zinc-700/50">
              <th
                className="px-3 py-3 text-left text-zinc-400 font-semibold sticky left-0 bg-zinc-800/80 z-10"
                style={{ minWidth: 40 }}
              >
                No
              </th>
              <th
                className="px-3 py-3 text-left text-zinc-400 font-semibold sticky left-[40px] bg-zinc-800/80 z-10"
                style={{ minWidth: 160 }}
              >
                Nama Driver
              </th>
              <th
                className="px-3 py-3 text-left text-zinc-400 font-semibold"
                style={{ minWidth: 80 }}
              >
                Nopol
              </th>
              {PERIOD_LABELS.map((label, i) => (
                <th
                  key={label}
                  className="text-center text-zinc-400 font-semibold"
                  style={{ minWidth: 110 }}
                >
                  <div className="px-2 py-1">
                    <div className="text-zinc-300 font-bold">{label}</div>
                    <div className="text-zinc-500 text-[10px] font-normal">
                      Tgl {PERIOD_RANGES[i]}
                    </div>
                    <div className="flex justify-center gap-1 mt-0.5">
                      <span className="text-[9px] text-sky-400">KHD</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-[9px] text-emerald-400">RTS</span>
                    </div>
                  </div>
                </th>
              ))}
              <th
                className="px-2 py-3 text-center text-sky-400 font-bold"
                style={{ minWidth: 60 }}
              >
                Total
                <br />
                KHD
              </th>
              <th
                className="px-2 py-3 text-center text-emerald-400 font-bold"
                style={{ minWidth: 60 }}
              >
                Total
                <br />
                RTS
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + 4 + 2}
                  className="text-center py-10 text-zinc-500"
                >
                  {search ? "Driver tidak ditemukan" : "Tidak ada data driver"}
                </td>
              </tr>
            ) : (
              filtered.map((drv, idx) => (
                <tr
                  key={drv.driver_id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition"
                >
                  <td className="px-3 py-2.5 text-zinc-500 sticky left-0 bg-zinc-900/90 z-10">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5 text-white font-medium sticky left-[40px] bg-zinc-900/90 z-10">
                    {drv.name}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-400 font-mono">
                    {drv.plate}
                  </td>
                  {drv.periods.map((p) => {
                    const isFraud = p.fraud;
                    return (
                      <td
                        key={p.label}
                        className={`px-1 py-2.5 text-center ${isFraud ? "bg-red-900/50" : ""}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={
                              p.khd === 0
                                ? isFraud
                                  ? "text-red-400 font-bold"
                                  : "text-zinc-600"
                                : "text-sky-400"
                            }
                          >
                            {p.khd}
                          </span>
                          <span className="text-zinc-700">|</span>
                          <span
                            className={
                              isFraud
                                ? "text-red-400 font-bold"
                                : p.rts > 0
                                  ? "text-emerald-400"
                                  : "text-zinc-600"
                            }
                          >
                            {p.rts}
                          </span>
                        </div>
                        {isFraud && (
                          <div className="text-[8px] text-red-400 mt-0.5 flex items-center justify-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> BOCOR
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td
                    className={`px-2 py-2.5 text-center font-bold ${drv.total_khd < LOW_KHD_THRESHOLD ? "text-red-400 bg-red-900/40" : "text-sky-400"}`}
                  >
                    {drv.total_khd}
                    {drv.total_khd < LOW_KHD_THRESHOLD && (
                      <div className="text-[8px] text-red-400 mt-0.5">
                        RENDAH
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center font-bold text-emerald-400">
                    {drv.total_rts}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LaporanMingguan() {
  const { getAuthHeader, API } = useAuth();
  const [month, setMonth] = useState(() => formatMonthISO(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/monthly-report?month=${month}`, {
        headers: getAuthHeader(),
      });
      setData(res.data);
    } catch {
      toast.error("Gagal memuat laporan bulanan");
    } finally {
      setLoading(false);
    }
  }, [API, getAuthHeader, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const prevMonth = () => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setMonth(formatMonthISO(d));
  };

  const nextMonth = () => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m, 1);
    setMonth(formatMonthISO(d));
  };

  const thisMonth = () => {
    setMonth(formatMonthISO(new Date()));
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const url = `${API}/monthly-report/export/${type}?month=${month}`;
      const res = await axios.get(url, {
        headers: getAuthHeader(),
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `laporan_bulanan_${month}.${type}`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`Export ${type.toUpperCase()} berhasil`);
    } catch {
      toast.error(`Gagal export ${type.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const { standarDrivers, premiumDrivers } = useMemo(() => {
    if (!data?.drivers) return { standarDrivers: [], premiumDrivers: [] };
    return {
      standarDrivers: data.drivers.filter(
        (d) => (d.category || "standar") === "standar",
      ),
      premiumDrivers: data.drivers.filter(
        (d) => (d.category || "standar") === "premium",
      ),
    };
  }, [data]);

  const fraudCount = useMemo(() => {
    if (!data?.drivers) return 0;
    let count = 0;
    data.drivers.forEach((drv) => {
      drv.periods.forEach((p) => {
        if (p.fraud) count++;
      });
    });
    return count;
  }, [data]);

  const lowStandar = useMemo(
    () => standarDrivers.filter((d) => d.total_khd < LOW_KHD_THRESHOLD),
    [standarDrivers],
  );
  const lowPremium = useMemo(
    () => premiumDrivers.filter((d) => d.total_khd < LOW_KHD_THRESHOLD),
    [premiumDrivers],
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Laporan Bulanan
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Audit kehadiran &amp; ritase driver per periode bulanan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting || !data}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting || !data}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/20 text-red-400 text-xs font-medium hover:bg-red-600/30 transition disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">
                {formatMonthLabel(month)}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={thisMonth}
              className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition"
            >
              Bulan Ini
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 w-full md:w-64 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </motion.div>

      {fraudCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/30 border border-red-700/40">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">
              <span className="font-bold text-red-400">{fraudCount}</span> Periode
              dengan Fraud (KHD=0, RTS&gt;0)
            </span>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-amber-500 font-mono text-sm animate-pulse">
            Memuat data laporan...
          </div>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-zinc-500 text-sm">Tidak ada data</div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <DriverTable
              drivers={standarDrivers}
              title="Driver Standar"
              search={search}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DriverTable
              drivers={premiumDrivers}
              title="Driver Premium"
              search={search}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Kesimpulan
              </h3>
              <div className="space-y-2 text-sm">
                <div
                  className={`px-3 py-2 rounded-lg ${lowStandar.length > 0 ? "bg-red-900/20 border border-red-800/30" : "bg-zinc-800/30 border border-zinc-700/30"}`}
                >
                  <span className="text-zinc-400">
                    Driver Standar (KHD &lt; {LOW_KHD_THRESHOLD}):{" "}
                  </span>
                  <span
                    className={`font-bold ${lowStandar.length > 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {lowStandar.length}
                  </span>
                  <span className="text-zinc-400"> driver</span>
                  {lowStandar.length > 0 && (
                    <span className="text-zinc-300">
                      {" "}
                      → {lowStandar.map((d) => d.name).join(", ")}
                    </span>
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg ${lowPremium.length > 0 ? "bg-red-900/20 border border-red-800/30" : "bg-zinc-800/30 border border-zinc-700/30"}`}
                >
                  <span className="text-zinc-400">
                    Driver Premium (KHD &lt; {LOW_KHD_THRESHOLD}):{" "}
                  </span>
                  <span
                    className={`font-bold ${lowPremium.length > 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {lowPremium.length}
                  </span>
                  <span className="text-zinc-400"> driver</span>
                  {lowPremium.length > 0 && (
                    <span className="text-zinc-300">
                      {" "}
                      → {lowPremium.map((d) => d.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-900/50 border border-red-700/50" />
            <span>KHD=0, RTS&gt;0 dalam satu periode = Potensi Kebocoran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold">RENDAH</span>
            <span>Total KHD &lt; {LOW_KHD_THRESHOLD} dalam sebulan</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
