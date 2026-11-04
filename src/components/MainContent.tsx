import Grid from "@mui/material/Unstable_Grid2";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Prayer from "./Prayer";
import ImageCard from "./ImageCard";
import Box from "@mui/material/Box";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  PRAYER_ORDER,
  Timings,
  formatCountdown,
  getNextPrayer,
} from "../lib/nextPrayer";

import "moment/dist/locale/ar";
moment.locale("ar");

const DEFAULT_CITY = "القاهرة";

const PRAYER_NAMES: Record<keyof Timings, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

type Status = "loading" | "ready" | "error";

const MainContent = () => {
  const [today, setToday] = useState("");
  const [nextPrayerIndex, setNextPrayerIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [timings, setTimings] = useState<Timings | null>(null);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [failedCity, setFailedCity] = useState("");
  const [search, setSearch] = useState("");

  const loadCity = useCallback(async (address: string) => {
    setStatus("loading");
    try {
      // Aladhan expects DD-MM-YYYY; use the local date, not the UTC one.
      const date = moment().locale("en").format("DD-MM-YYYY");
      const res = await axios.get(
        `https://api.aladhan.com/v1/timingsByAddress/${date}`,
        { params: { address }, timeout: 15000 }
      );
      const t = res.data?.data?.timings;
      if (!t?.Fajr || !t?.Isha) throw new Error("Missing timings");
      setTimings({
        fajr: t.Fajr,
        dhuhr: t.Dhuhr,
        asr: t.Asr,
        maghrib: t.Maghrib,
        isha: t.Isha,
      });
      setCity(address);
      setStatus("ready");
    } catch {
      setFailedCity(address);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadCity(DEFAULT_CITY);
    setToday(moment().format("Do MMM YYYY | h:mm"));
  }, [loadCity]);

  function searchHandler(e: SyntheticEvent) {
    e.preventDefault();
    const query = search.trim();
    if (query === "") {
      alert("ادخل اسم المدينة");
      return;
    }
    loadCity(query);
    setSearch("");
  }

  useEffect(() => {
    if (!timings) return;
    const tick = () => {
      const { index, remainingMs } = getNextPrayer(timings, new Date());
      setNextPrayerIndex(index);
      setRemainingTime(formatCountdown(remainingMs));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [timings]);

  return (
    <>
      {/* TOP ROW */}
      <div className="top">
        <Grid container>
          <Grid xs={6}>
            <div>
              <h1>{city}</h1>
              <p style={{ color: "var(--gray)" }}>{today}</p>
            </div>
          </Grid>

          <div className="search">
            <Grid xs={6} style={{ padding: "20px 0" }}>
              <Box sx={{ minWidth: 120 }}>
                <form className="form" onSubmit={searchHandler}>
                  <input
                    type="text"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="اسم المدينة"
                    aria-label="اسم المدينة"
                    value={search}
                  />
                  <button className="btn" type="submit">
                    بحث
                  </button>
                </form>
              </Box>
            </Grid>
          </div>
        </Grid>
      </div>
      {/* TOP ROW */}

      <Divider style={{ background: `var(--gray)` }} />

      {/* Prayer Cards */}
      {status === "ready" && timings ? (
        <div className="content" style={{ padding: "10px 0" }}>
          <Grid container spacing={2}>
            <Grid xs={6} style={{ padding: "20px" }}>
              <ImageCard
                time={remainingTime}
                name={PRAYER_NAMES[PRAYER_ORDER[nextPrayerIndex]]}
              />
            </Grid>

            <Grid xs={6} style={{ padding: "20px" }}>
              <Stack>
                {PRAYER_ORDER.map((key, i) => (
                  <Prayer
                    key={key}
                    name={PRAYER_NAMES[key]}
                    time={timings[key]}
                    active={i === nextPrayerIndex}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </div>
      ) : status === "error" ? (
        <div className="error" role="alert">
          <p>
            تعذر تحميل مواعيد الصلاة لمدينة "{failedCity}". تأكد من اسم المدينة
            أو من اتصالك بالإنترنت.
          </p>
          <div className="error-actions">
            <button
              className="btn"
              type="button"
              onClick={() => loadCity(failedCity)}
            >
              إعادة المحاولة
            </button>
            {failedCity !== city && (
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => loadCity(city)}
              >
                عرض {city}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="loading" role="status" aria-label="جار التحميل"></div>
      )}
    </>
  );
};

export default MainContent;
