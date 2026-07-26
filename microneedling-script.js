const form = document.getElementById('microneedlingForm');
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

form.elements.page2Date.addEventListener('input', formatDateInput);
form.elements.signatureDate.addEventListener('input', formatDateInput);

function buildSummary(data) {
  return `
【マイクロチャネリング同意書 入力内容を受け付けました】

【禁忌事項チェック】
18歳以上: ${data.over18 ? 'はい' : 'いいえ'}
直近7日以内のアスピリン・血液サラサラ薬: ${data.bloodThinners7d ? 'はい' : 'いいえ'}
アロエベラアレルギー: ${data.aloeAllergy ? 'はい' : 'いいえ'}
直近8時間以内の気分を変える薬: ${data.moodDrugs8h ? 'はい' : 'いいえ'}
コールドソア/ヘルペス確認イニシャル: ${data.initialColdSore || '未記入'}

【追加問診】
ラテックス過敏: ${data.latexSensitive ? 'はい' : 'いいえ'}
ケミカル・レーザーピール歴: ${data.chemicalLaserPeel ? 'はい' : 'いいえ'}${data.chemicalLaserPeelWhen ? `（時期: ${data.chemicalLaserPeelWhen}）` : ''}
治りにくい体質: ${data.troubleHealing ? 'はい' : 'いいえ'}
ボトックス・フィラー歴: ${data.botoxFiller ? 'はい' : 'いいえ'}${data.botoxFillerWhen ? `（時期: ${data.botoxFillerWhen}）` : ''}
放射線・化学療法中: ${data.radiationChemo ? 'はい' : 'いいえ'}
アキュテイン・レチンA等使用中: ${data.accutaneRetinA ? 'はい' : 'いいえ'}
金属アレルギー: ${data.metalAllergy ? 'はい' : 'いいえ'}${data.metalAllergyDetail ? `（内容: ${data.metalAllergyDetail}）` : ''}
抗炎症薬・ステロイド使用中: ${data.antiInflammatorySteroid ? 'はい' : 'いいえ'}
麻酔アレルギー: ${data.anestheticAllergy ? 'はい' : 'いいえ'}${data.anestheticAllergyDetail ? `（内容: ${data.anestheticAllergyDetail}）` : ''}
皮膚疾患歴: ${data.skinDiseaseHistory ? 'はい' : 'いいえ'}
皮膚が敏感: ${data.skinSensitivityHistory ? 'はい' : 'いいえ'}
ビタミンA・E摂取中: ${data.vitaminAE ? 'はい' : 'いいえ'}
妊娠中・授乳中: ${data.pregnantNursing ? 'はい' : 'いいえ'}
皮膚科通院中: ${data.dermatologistCare ? 'はい' : 'いいえ'}${data.dermatologistDetail ? `（内容: ${data.dermatologistDetail}）` : ''}${data.dermatologistName ? `（皮膚科医名: ${data.dermatologistName}）` : ''}

該当項目: ${data.conditions && data.conditions.length ? data.conditions.join('、') : 'なし'}
イニシャル: ${data.initialPage2 || '未記入'}
日付: ${data.page2Date || '未記入'}

【施術同意書】
写真撮影の条件についてのイニシャル: ${data.initialPhotos || '未記入'}
マーケティング利用の写真同意: ${data.photoConsent || '未選択'}
（いいえの場合）ぼかし使用の可否: ${data.photoBlurConsent || '未選択'}
同意項目: ${data.consentQuestions ? '説明を理解した' : '未同意'} / ${data.consentIndemnify ? '免責に同意' : '未同意'}

署名: ${data.signature || '未記入'}
署名した日にち: ${data.signatureDate || '未記入'}
`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.conditions = formData.getAll('conditions');

  if (!data.consentQuestions || !data.consentIndemnify) {
    result.textContent = 'すべての同意チェック項目にチェックを入れてください。';
    return;
  }

  if (!data.signature || !data.signatureDate) {
    result.textContent = '署名と署名した日にちを入力してください。';
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
  localStorage.setItem('microneedling-consent-data', JSON.stringify(data));

  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `microneedling-consent-${timestamp}.txt`;
  link.textContent = '保存ファイルをダウンロード';
  link.style.display = 'inline-block';
  link.style.marginTop = '12px';
  result.appendChild(link);

  form.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const savedData = localStorage.getItem('microneedling-consent-data');
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
