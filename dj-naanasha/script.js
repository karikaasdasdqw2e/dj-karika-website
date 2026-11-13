const WHATSAPP_NUMBER = "201015212099";

const form = document.querySelector("#weddingPlaylistForm");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const progressTrack = document.querySelector(".progress-track");
const phoneInput = document.querySelector("#phone");
const phoneError = document.querySelector("#phoneError");
const dateInput = document.querySelector("#weddingDate");
const submitStatus = document.querySelector("#submitStatus");
const requiredFields = [...form.querySelectorAll("[required]")];

const arabicNumber = new Intl.NumberFormat("ar-EG", {
  maximumFractionDigits: 0,
});

function setMinimumWeddingDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  dateInput.min = now.toISOString().split("T")[0];
}

function cleanPhoneNumber(value) {
  return value.replace(/[\s()+-]/g, "");
}

function validatePhone() {
  const cleaned = cleanPhoneNumber(phoneInput.value);
  const isValid = /^\d{10,15}$/.test(cleaned);

  if (phoneInput.value && !isValid) {
    phoneInput.setCustomValidity("اكتبوا رقم تليفون صحيح من ١٠ إلى ١٥ رقم.");
    phoneInput.classList.add("is-invalid");
    phoneError.textContent = "اكتبوا رقم تليفون صحيح من ١٠ إلى ١٥ رقم.";
    return false;
  }

  phoneInput.setCustomValidity("");
  phoneInput.classList.remove("is-invalid");
  phoneError.textContent = "";
  return true;
}

function updateProgress() {
  const completed = requiredFields.filter((field) => field.value.trim()).length;
  const percentage = Math.round((completed / requiredFields.length) * 100);
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${arabicNumber.format(percentage)}٪`;
  progressTrack.setAttribute("aria-valuenow", String(percentage));
}

function formatWeddingDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function numberedSongs(data, prefix, count) {
  return Array.from({ length: count }, (_, index) => {
    const value = data.get(`${prefix}${index + 1}`);
    return `${index + 1}- ${value}`;
  }).join("\n");
}

function buildWhatsAppMessage(data) {
  const city = data.get("city")?.trim();
  const notes = data.get("notes")?.trim();
  const place = city ? `${data.get("venue")} — ${city}` : data.get("venue");

  return [
    "*طلب بلاي ليست فرح جديد 🎧*",
    "",
    "*بيانات الفرح*",
    `العريس: ${data.get("groomName")}`,
    `العروسة: ${data.get("brideName")}`,
    `تاريخ الفرح: ${formatWeddingDate(data.get("weddingDate"))}`,
    `المكان: ${place}`,
    `رقم التواصل: ${data.get("phone")}`,
    "",
    "*الزفات المفضلة*",
    numberedSongs(data, "zaffa", 2),
    "",
    "*أغاني الرقص السلو*",
    numberedSongs(data, "slow", 2),
    "",
    "*الأغاني الكلاسيك*",
    numberedSongs(data, "classic", 3),
    "",
    "*المهرجانات*",
    numberedSongs(data, "mahragan", 5),
    "",
    "*الأغاني الشعبي*",
    numberedSongs(data, "shaabi", 5),
    ...(notes ? ["", "*ملاحظات إضافية*", notes] : []),
    "",
    "بلاي ليست فرحنا مع دي جي نعنشه ✨",
  ].join("\n");
}

function focusFirstInvalidField() {
  const invalid = form.querySelector(":invalid");
  if (!invalid) return;

  invalid.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => invalid.focus({ preventScroll: true }), 350);
}

form.addEventListener("input", (event) => {
  if (event.target === phoneInput) validatePhone();
  updateProgress();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.classList.add("was-validated");
  validatePhone();

  if (!form.checkValidity()) {
    submitStatus.textContent = "كمّلوا الخانات المطلوبة الأول، وهناخدكم لأول خانة ناقصة.";
    focusFirstInvalidField();
    return;
  }

  const data = new FormData(form);
  const message = buildWhatsAppMessage(data);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  submitStatus.textContent = "تمام! بنفتح لكم الرسالة دلوقتي علشان تراجعوها وتبعتوها.";
  window.location.href = whatsappUrl;
});

function stageWeddingPlaylist(input) {
  const arrayFields = {
    zaffas: ["zaffa1", "zaffa2"],
    slowSongs: ["slow1", "slow2"],
    classicSongs: ["classic1", "classic2", "classic3"],
    mahraganat: ["mahragan1", "mahragan2", "mahragan3", "mahragan4", "mahragan5"],
    shaabiSongs: ["shaabi1", "shaabi2", "shaabi3", "shaabi4", "shaabi5"],
  };

  const directFields = [
    "groomName",
    "brideName",
    "phone",
    "weddingDate",
    "venue",
    "city",
    "notes",
  ];
  let filledFields = 0;

  directFields.forEach((name) => {
    if (typeof input[name] !== "string") return;
    const field = form.elements.namedItem(name);
    field.value = input[name];
    field.dispatchEvent(new Event("input", { bubbles: true }));
    filledFields += 1;
  });

  Object.entries(arrayFields).forEach(([inputName, fieldNames]) => {
    if (!Array.isArray(input[inputName])) return;
    fieldNames.forEach((fieldName, index) => {
      if (typeof input[inputName][index] !== "string") return;
      const field = form.elements.namedItem(fieldName);
      field.value = input[inputName][index];
      field.dispatchEvent(new Event("input", { bubbles: true }));
      filledFields += 1;
    });
  });

  form.scrollIntoView({ behavior: "smooth", block: "start" });
  return { status: "staged", filledFields };
}

function registerWebMcpTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const songArray = (length) => ({
    type: "array",
    items: { type: "string" },
    minItems: length,
    maxItems: length,
  });

  try {
    void Promise.resolve(
      context.registerTool({
        name: "stage_wedding_playlist",
        title: "تجهيز بلاي ليست الفرح",
        description:
          "يملأ فورم بلاي ليست الفرح بالبيانات والاختيارات المعطاة لتظهر للمستخدم ويراجعها قبل إرسالها على واتساب.",
        inputSchema: {
          type: "object",
          properties: {
            groomName: { type: "string" },
            brideName: { type: "string" },
            phone: { type: "string" },
            weddingDate: { type: "string", format: "date" },
            venue: { type: "string" },
            city: { type: "string" },
            zaffas: songArray(2),
            slowSongs: songArray(2),
            classicSongs: songArray(3),
            mahraganat: songArray(5),
            shaabiSongs: songArray(5),
            notes: { type: "string" },
          },
          additionalProperties: false,
        },
        annotations: {
          readOnlyHint: false,
          untrustedContentHint: false,
        },
        execute(input) {
          if (!input || typeof input !== "object" || Array.isArray(input)) {
            throw new TypeError("لازم بيانات البلاي ليست تكون في صورة كائن.");
          }
          return stageWeddingPlaylist(input);
        },
      }),
    ).catch(() => {});
  } catch {
    // الموقع يفضل شغال بشكل طبيعي في المتصفحات التي لا تدعم WebMCP.
  }
}

setMinimumWeddingDate();
updateProgress();
registerWebMcpTool();
