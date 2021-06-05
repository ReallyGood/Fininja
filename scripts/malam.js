function processAndInject() {
  const grab = (id) =>
    parseFloat(document.querySelector(`#${id}`).textContent.replace(/,/g, ""));

  const sum = (arr) =>
    parseFloat(
      arr
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        .toFixed(2)
    );

  const taxRobbery = sum([
    grab("PS_EX_ER_CONT_NI"), // ביטוח לאומי מעסיק
    grab("EX_TAX_DED"), // מס הכנסה
    grab("EX_NI_DED"), // ביטוח לאומי
    grab("EX_HI_DED"), // ביטוח בריאות
  ]);

  const social = sum([
    grab("PS_ER_PENS_AMT"), // קופת גמל מעסיק
    grab("PS_ER_STDY_FND_AMT"), // קרן השתלמות מעסיק
    grab("PS_ER_COPMNS_AMT"), // פיצויים מעסיק
    grab("PS_EE_PENS_AMT"), // קופת גמל
    grab("PS_EE_STDY_FND_AMT"), // קרן השתלמות
  ]);

  const employerCost = grab("PS_EX_COST");
  const net = grab("EX_NET");

  // sanity
  if (Math.abs(employerCost - sum([net, social, taxRobbery]) < 2)) {
    console.log("yes good to go!");
  } else {
    alert("טוב, משהו לא מסתדר במספרים שלנו 🤔 אם זה חוזר, נשמח לשמוע על הבעיה");
  }
}

function init() {
  if (!location.href.startsWith("https://calc.malam-payroll.com/neto.php")) {
    return;
  }

  const anyValue = document.querySelector("#EX_NET").textContent;
  if (anyValue) {
    processAndInject();
  }
}

init();
