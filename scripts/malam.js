// helper: grab that raw number from that element id
function grab(id) {
  return parseFloat(
    document.querySelector(`#${id}`).textContent.replace(/,/g, "")
  );
}

// helper: sum numbers from array
function sum(arr) {
  return parseFloat(
    arr
      .reduce(
        (accumulator, currentValue) => accumulator + (currentValue || 0),
        0
      )
      .toFixed(2)
  );
}

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
    const taxPercentage = ((taxRobbery / employerCost) * 100).toFixed(1);
    const results = { taxRobbery, social, employerCost, net, taxPercentage };
    inject(results);
    localStorage.setItem("prevFininjaResults", JSON.stringify(results));
  } else {
    alert("טוב, משהו לא מסתדר במספרים שלנו 🤔 אם זה חוזר, נשמח לשמוע על הבעיה");
  }
}

function inject(results) {
  if (!results || document.querySelector("#fininja-results")) {
    console.warn("No data found for Fininja calc or already injected");
    return;
  }

  const { taxRobbery, social, employerCost, net, taxPercentage } = results;

  const prev = JSON.parse(localStorage.getItem("prevFininjaResults"));

  const format = (number, { addSign = false } = {}) => {
    const sign = addSign && number > 0 ? "+" : "";
    return `${sign}${number.toLocaleString("he-IL")}`;
  };

  const newMarkup = `
  <style>
    #fininja .dim { opacity: 0.6; }
    #fininja table { width: 609px; margin-bottom: 15px; font-weight: normal; }
    #fininja table th:nth-child(n+2) { width: 120px; }
    #fininja table td:nth-child(4) { direction: ltr; }
    #fininja table.noPrev th:nth-child(n+2) { display: none; }
    #fininja table td:first-child { font-weight: normal; }
    #fininja footer { padding-right: 7px; }
    #fininja footer img { display: inline; height: 16px; vertical-align: -3px; margin-left: 3px; }
  </style>
  <div id="fininja">
    <h1 class="brcolor5" id="fininja-results"><span>כמה עשית החודש?</span></h1>
    <table class="tablestylelines ${!prev && "noPrev"}">
      <thead>
        <tr>
          <th></th>
          <th>בחישוב הזה</th>
          <th>בחישוב הקודם</th>
          <th>הפרש</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>עלות מעסיק</td>
          <td>${format(employerCost)}</td>
          <td>${format(prev.employerCost)}</td>
          <td>${format(employerCost - prev.employerCost, {
            addSign: true,
          })}</td>
        </tr>
        <tr>
          <td>מיסים</td>
          <td>${format(
            taxRobbery
          )} <span class="dim">(%${taxPercentage})</span></td>
          <td>${format(prev.taxRobbery)} <span class="dim">(%${
    prev.taxPercentage
  })</span></td>
          <td>${format(taxRobbery - prev.taxRobbery, { addSign: true })}</td>
        </tr>
        <tr>
          <td>סוציאליות</td>
          <td>${format(social)}</td>
          <td>${format(prev.social)}</td>
          <td>${format(social - prev.social, { addSign: true })}</td>
        </tr>
        <tr>
          <td>נטו בבנק</td>
          <td>${format(net)}</td>
          <td>${format(prev.net)}</td>
          <td>${format(net - prev.net, { addSign: true })}</td>
        </tr>
        <tr>
          <td>אצלך בכיס (נטו + סוציאליות)</td>
          <td>${format(sum([net, social]))}</td>
          <td>${format(sum([prev.net, prev.social]))}</td>
          <td>${format(sum([net, social]) - sum([prev.net, prev.social]), {
            addSign: true,
          })}</td>
        </tr>
      </tbody>
    </table>
    <footer>
      <a href="https://www.facebook.com/groups/Fininja" target="_blank" title="ללמוד איך כסף עובד">
        <img src="${chrome.runtime.getURL(
          "images/fininja-icon.png"
        )}">נינג'ה פיננסית</a> |
      <a href="https://reallygood.co.il?utm_source=fininja&utm_campaign=calc" title="High-End Front-End" target="_blank">
        <img src="${chrome.runtime.getURL(
          "images/rg-logo.svg"
        )}">Really Good</a> | 
          <a href="https://github.com/ReallyGood/Fininja" title="קוד ב-github ומדיניות פרטיות" target="_blank">
        <img src="${chrome.runtime.getURL("images/github.svg")}">קוד ופרטיות</a>
      </footer>
    </div>
  `;

  const slip = document.querySelector("#paySlip");
  const newContainer = document.createElement("div");
  newContainer.setAttribute("style", "margin-bottom: 30px;");
  newContainer.innerHTML = newMarkup;
  slip.prepend(newContainer);
}

init();
