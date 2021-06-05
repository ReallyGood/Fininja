function init() {
  // only run on Malam's calc iframe
  if (!location.href.startsWith("https://calc.malam-payroll.com/neto.php")) {
    return;
  }

  // make sure we have the slip already
  const anyValue = document.querySelector("#EX_NET").textContent;
  if (anyValue) {
    processAndInject();
  }
}

function processAndInject() {
  // helper: grab that raw number from that element id
  const grab = (id) =>
    parseFloat(document.querySelector(`#${id}`).textContent.replace(/,/g, ""));

  // helper: sum numbers from array
  const sum = (arr) =>
    parseFloat(
      arr
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        .toFixed(2)
    );

  // grab everything
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

  // sanity. Allow for a tiny difference due to js infamous handling of floating point numbers
  if (Math.abs(employerCost - sum([net, social, taxRobbery]) < 2)) {
    inject({ taxRobbery, social, employerCost, net });
  } else {
    alert("טוב, משהו לא מסתדר במספרים שלנו 🤔 אם זה חוזר, נשמח לשמוע על הבעיה");
  }
}

function inject(results) {
  if (!results || document.querySelector("#fininja-results")) {
    console.warn("No data found for Fininja calc or already injected");
    return;
  }

  const { taxRobbery, social, employerCost, net } = results;

  const format = (number) => number.toLocaleString("he-IL");

  const newMarkup = `
  <h1 class="brcolor5" id="fininja-results"><span>כמה עשית החודש?</span></h1>
  <table class="tablestylelines" style="width: 34%; margin-bottom: 30px;">
    <tbody>
    <tr>
        <td>עלות מעסיק</td>
        <td>${format(employerCost)}</td>
      </tr>
      <tr>
        <td>מתוך זה סוציאליות</td>
        <td style="direction: ltr;">-${format(social)}</td>
      </tr>
      <tr>
        <td>סה"כ מיסים</td>
        <td style="direction: ltr;">-${format(taxRobbery)}</td>
      </tr>
      <tr>
        <td>נטו בבנק</td>
        <td>${format(net)}</td>
      </tr>
    </tbody>
  </table>
  `;

  const slip = document.querySelector("#paySlip");
  const newContainer = document.createElement("div");
  newContainer.innerHTML = newMarkup;
  slip.prepend(newContainer);
}

init();
