const form = document.getElementById('intakeForm');
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

form.elements.birthDate.addEventListener('input', formatDateInput);
form.elements.signatureDate.addEventListener('input', formatDateInput);

function buildSummary(data) {
  const consentItems = [
    data.consentSafety ? '安全手順への同意' : '安全手順への同意なし',
    data.consentRisk ? '停止手順への同意' : '停止手順への同意なし',
    data.consentData ? '情報提供への同意' : '情報提供への同意なし',
    data.consentDisclaimer ? '免責事項・宣誓事項への同意' : '免責事項・宣誓事項への同意なし',
    data.consentTreatment ? '施術同意' : '施術同意なし',
    data.consentMedical ? '医療行為ではないことの理解への同意' : '医療行為ではないことの理解への同意なし',
    data.consentPrivacy ? '個人情報の取り扱いへの同意' : '個人情報の取り扱いへの同意なし'
  ];

  const referralLine = data.referralSource && data.referralSource.length
    ? data.referralSource.join('、')
    : '未記入';

  return `
【入力内容を受け付けました】

名: ${data.firstName || '未記入'}
姓: ${data.lastName || '未記入'}
生年月日: ${data.birthDate || '未記入'}
電話番号: ${data.phone || '未記入'}
メールアドレス: ${data.email || '未記入'}
職業: ${data.occupation || '未記入'}
ご住所: ${data.addressStreet || '未記入'} ${data.addressCity || ''} ${data.addressState || ''} ${data.addressZip || ''}

どちらでお知りになりましたか: ${referralLine}${data.referralName ? `（紹介者: ${data.referralName}）` : ''}${data.referralOther ? `（その他: ${data.referralOther}）` : ''}

【健康チェック】
該当項目: ${data.symptoms && data.symptoms.length ? data.symptoms.join('、') : 'なし'}
妊娠週数: ${data.pregnancyWeeks || '未記入'}
アレルギーの内容: ${data.allergyDetail || '未記入'}
ヘルニア・骨の病気の内容: ${data.herniaDetail || '未記入'}
最近の手術の内容: ${data.recentSurgeryDetail || '未記入'}
美容整形の内容: ${data.cosmeticSurgeryDetail || '未記入'}
服薬中・治療中の内容: ${data.medicationDetail || '未記入'}
その他の疾患の内容: ${data.otherHealthDetail || '未記入'}
その他、施術時の注意点: ${data.healthDetails || '未記入'}
希望の圧力: ${data.pressurePreference || '未選択'}

【お顔の悩み】
該当項目: ${data.facialConcerns && data.facialConcerns.length ? data.facialConcerns.join('、') : 'なし'}${data.facialConcernOther ? `（その他: ${data.facialConcernOther}）` : ''}

【ボディの悩み】
該当項目: ${data.bodyConcerns && data.bodyConcerns.length ? data.bodyConcerns.join('、') : 'なし'}${data.bodyConcernOther ? `（その他: ${data.bodyConcernOther}）` : ''}
マッサージ・整体・美容施術の経験: ${data.massageHistory || '未記入'}${data.lastMassage ? `（最後に受けた時期: ${data.lastMassage}）` : ''}

【本日のご要望】
施術希望部位: ${data.desiredAreas && data.desiredAreas.length ? data.desiredAreas.join('、') : 'なし'}
本日の体調: ${data.todayCondition || '未選択'}
本日の目的: ${data.todayGoals && data.todayGoals.length ? data.todayGoals.join('、') : 'なし'}

【同意・証明】
同意内容: ${consentItems.join(' / ')}
署名: ${data.signature || '未記入'}
署名した日にち: ${data.signatureDate || '未記入'}
`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.symptoms = formData.getAll('symptoms');
  data.facialConcerns = formData.getAll('facialConcerns');
  data.bodyConcerns = formData.getAll('bodyConcerns');
  data.referralSource = formData.getAll('referralSource');
  data.desiredAreas = formData.getAll('desiredAreas');
  data.todayGoals = formData.getAll('todayGoals');
  data.consentSafety = form.elements.consentSafety.checked;
  data.consentRisk = form.elements.consentRisk.checked;
  data.consentData = form.elements.consentData.checked;
  data.consentDisclaimer = form.elements.consentDisclaimer.checked;
  data.consentTreatment = form.elements.consentTreatment.checked;
  data.consentMedical = form.elements.consentMedical.checked;
  data.consentPrivacy = form.elements.consentPrivacy.checked;

  if (!data.firstName || !data.lastName || !data.birthDate || !data.phone || !data.email || !data.signature) {
    result.textContent = '必須項目（名、姓、生年月日、電話番号、メールアドレス、署名）を入力してください。';
    return;
  }

  if (!data.referralSource.length) {
    result.textContent = '「どちらでお知りになりましたか?」を選択してください。';
    return;
  }

  if (
    !data.consentSafety ||
    !data.consentRisk ||
    !data.consentData ||
    !data.consentDisclaimer ||
    !data.consentTreatment ||
    !data.consentMedical ||
    !data.consentPrivacy
  ) {
    result.textContent = 'すべての同意チェック項目にチェックを入れてください。';
    return;
  }

  if (!data.signatureDate) {
    result.textContent = '署名した日にちを入力してください。';
    return;
  }

  const summary = buildSummary(data);
  result.textContent = summary;

  const timestamp = new Date().toISOString();
  localStorage.setItem('customer-intake-data', JSON.stringify(data));

  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `customer-intake-${timestamp}.txt`;
  link.textContent = '保存ファイルをダウンロード';
  link.style.display = 'inline-block';
  link.style.marginTop = '12px';
  result.appendChild(link);
});

const savedData = localStorage.getItem('customer-intake-data');
if (savedData) {
  const parsed = JSON.parse(savedData);
  form.elements.firstName.value = parsed.firstName || '';
  form.elements.lastName.value = parsed.lastName || '';
  form.elements.birthDate.value = parsed.birthDate || '';
  form.elements.phone.value = parsed.phone || '';
  form.elements.email.value = parsed.email || '';
  form.elements.occupation.value = parsed.occupation || '';
  form.elements.addressStreet.value = parsed.addressStreet || '';
  form.elements.addressCity.value = parsed.addressCity || '';
  form.elements.addressState.value = parsed.addressState || '';
  form.elements.addressZip.value = parsed.addressZip || '';

  const savedReferral = parsed.referralSource || [];
  form.querySelectorAll('input[name="referralSource"]').forEach((checkbox) => {
    checkbox.checked = savedReferral.includes(checkbox.value);
  });
  form.elements.referralName.value = parsed.referralName || '';
  form.elements.referralOther.value = parsed.referralOther || '';

  const savedSymptoms = parsed.symptoms || [];
  form.querySelectorAll('input[name="symptoms"]').forEach((checkbox) => {
    checkbox.checked = savedSymptoms.includes(checkbox.value);
  });
  form.elements.healthDetails.value = parsed.healthDetails || '';
  form.elements.pregnancyWeeks.value = parsed.pregnancyWeeks || '';
  form.elements.allergyDetail.value = parsed.allergyDetail || '';
  form.elements.herniaDetail.value = parsed.herniaDetail || '';
  form.elements.recentSurgeryDetail.value = parsed.recentSurgeryDetail || '';
  form.elements.cosmeticSurgeryDetail.value = parsed.cosmeticSurgeryDetail || '';
  form.elements.medicationDetail.value = parsed.medicationDetail || '';
  form.elements.otherHealthDetail.value = parsed.otherHealthDetail || '';
  if (parsed.pressurePreference) {
    const pressureRadio = form.querySelector(
      `input[name="pressurePreference"][value="${parsed.pressurePreference}"]`
    );
    if (pressureRadio) {
      pressureRadio.checked = true;
    }
  }

  const savedFacialConcerns = parsed.facialConcerns || [];
  form.querySelectorAll('input[name="facialConcerns"]').forEach((checkbox) => {
    checkbox.checked = savedFacialConcerns.includes(checkbox.value);
  });
  form.elements.facialConcernOther.value = parsed.facialConcernOther || '';

  const savedBodyConcerns = parsed.bodyConcerns || [];
  form.querySelectorAll('input[name="bodyConcerns"]').forEach((checkbox) => {
    checkbox.checked = savedBodyConcerns.includes(checkbox.value);
  });
  form.elements.bodyConcernOther.value = parsed.bodyConcernOther || '';
  form.elements.lastMassage.value = parsed.lastMassage || '';
  if (parsed.massageHistory) {
    const massageRadio = form.querySelector(
      `input[name="massageHistory"][value="${parsed.massageHistory}"]`
    );
    if (massageRadio) {
      massageRadio.checked = true;
    }
  }

  const savedDesiredAreas = parsed.desiredAreas || [];
  form.querySelectorAll('input[name="desiredAreas"]').forEach((checkbox) => {
    checkbox.checked = savedDesiredAreas.includes(checkbox.value);
  });

  if (parsed.todayCondition) {
    const conditionRadio = form.querySelector(
      `input[name="todayCondition"][value="${parsed.todayCondition}"]`
    );
    if (conditionRadio) {
      conditionRadio.checked = true;
    }
  }

  const savedTodayGoals = parsed.todayGoals || [];
  form.querySelectorAll('input[name="todayGoals"]').forEach((checkbox) => {
    checkbox.checked = savedTodayGoals.includes(checkbox.value);
  });

  form.elements.consentSafety.checked = parsed.consentSafety || false;
  form.elements.consentRisk.checked = parsed.consentRisk || false;
  form.elements.consentData.checked = parsed.consentData || false;
  form.elements.consentDisclaimer.checked = parsed.consentDisclaimer || false;
  form.elements.consentTreatment.checked = parsed.consentTreatment || false;
  form.elements.consentMedical.checked = parsed.consentMedical || false;
  form.elements.consentPrivacy.checked = parsed.consentPrivacy || false;
  form.elements.signature.value = parsed.signature || '';
  form.elements.signatureDate.value = parsed.signatureDate || '';
}
