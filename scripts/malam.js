function init() {
  if (!location.href.startsWith("https://calc.malam-payroll.com/neto.php")) {
    return;
  }

  const neto = document.querySelector("#EX_NET").textContent;
  const isShowingSlip = !!neto;
  if (isShowingSlip) {
    console.log("ok then");
  }
}

init();
