// utils/generateNumericId.js
module.exports = (() => {
  /* -------- OPTION A – YYMMDDHHmm (readable) -------- */
  const makeYyMmDdHhMm = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return Number(`${yy}${MM}${dd}${hh}${mm}`);      // 10‑digit integer
  };

  /* -------- OPTION B – Unix epoch seconds -------- */
  const makeUnixSeconds = () => Math.floor(Date.now() / 1000); // 10‑digit int until year 2286

  /*  -- final exported generator --  */
  return () => (
    // choose one ↓↓↓
    // makeYyMmDdHhMm()
    makeUnixSeconds()
  );
})();
