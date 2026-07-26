const form = document.getElementById('hifuForm');
const result = document.getElementById('result');

function formatDateInput(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
  let formatted = digits;
  if (digits.length > 4) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  } else if (digits.length > 2) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  event.target.value = formatted;
}

form.elements.consentDate.addEventListener('input', formatDateInput);

function buildSummary(data) {
  return `
【HIFU施術同意書 入力内容を受け付けました】

お名前: ${data.patientName || '未記入'}

【施術前の確認事項】
該当項目: ${data.conditions && data.conditions.length ? data.conditions.join('、') : 'なし'}
詳しく: ${data.conditionDetails || '未記入'}

【同意】
注意事項への同意: ${data.consentAgree ? '同意' : '未同意'}
施術内容・リスクの説明への同意: ${data.consentExplained ? '同意' : '未同意'}

署名: ${data.signature || '未記入'}
日付: ${data.consentDate || '未記入'}
`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.conditions = formData.getAll('conditions');

  if (!data.patientName || !data.signature || !data.consentDate) {
    result.textContent = 'お名前、署名、日付を入力してください。';
    return;
  }

  if (!data.consentAgree || !data.consentExplained) {
    result.textContent = 'すべての同意チェック項目にチェックを入れてください。';
    return;
  }

  const summary = buildSummary(data);

  const heading = document.createElement('h2');
  heading.textContent = '✓ ご入力内容を受け付けました';
  result.replaceChildren(heading);

  const summaryText = document.createElement('pre');
  summaryText.textContent = summary;
  result.appendChild(summaryText);

  const timestamp = new Date().toISOString();
  localStorage.setItem('hifu-consent-data', JSON.stringify(data));

  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `hifu-consent-${timestamp}.txt`;
  link.textContent = '保存ファイルをダウンロード';
  link.style.display = 'inline-block';
  link.style.marginTop = '12px';
  result.appendChild(link);

  form.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const savedData = localStorage.getItem('hifu-consent-data');
if (savedData) {
  const parsed = JSON.parse(savedData);
  Object.keys(parsed).forEach((key) => {
    const field = form.elements[key];
    if (!field) {
      return;
    }
    if (field instanceof RadioNodeList) {
      Array.from(field).forEach((input) => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = Array.isArray(parsed[key])
            ? parsed[key].includes(input.value)
            : parsed[key] === input.value;
        }
      });
    } else if (field.type === 'checkbox') {
      field.checked = Boolean(parsed[key]);
    } else {
      field.value = parsed[key];
    }
  });
}
