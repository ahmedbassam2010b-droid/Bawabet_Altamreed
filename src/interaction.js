
const descriptions = {
  "patient-room": {
    label: "باب غرفة المريض",
    message: "أنت أمام غرفة المريض الافتراضي. اقترب من الحالة التعليمية واقرأ الموقف قبل اتخاذ أي قرار.",
    action: "start"
  },
  "nursing-station": {
    label: "محطة التمريض",
    message: "هنا تتواصل مع الممرض المسؤول وتطلب التوجيه. العمل تحت الإشراف جزء أساسي من التدريب الآمن.",
    action: "supervisor"
  },
  "patient-monitor": {
    label: "جهاز مراقبة المريض",
    message: "هذا مجسم توضيحي لجهاز مراقبة. لا توجد قراءات سريرية حقيقية على هذا الجهاز في المحاكاة.",
    action: "monitor"
  }
};

export function createInteraction(sceneApi, onInteract) {
  let selected = null;
  const help = document.getElementById("scene-help");
  const locationLabel = document.getElementById("location-label");
  const canvas = sceneApi.renderer.domElement;

  function describe(object) {
    if (!object) return null;
    return descriptions[object.userData.interaction] || null;
  }

  function select(object) {
    selected = object;
    const data = describe(object);
    if (help) {
      help.textContent = data
        ? `${data.label} — اضغط «تفاعل مع المكان»`
        : "تحرك واستكشف المكان، ثم اقترب من عنصر قابل للتفاعل.";
    }
  }

  function interact() {
    const object = selected || sceneApi.getNearby();
    const data = describe(object);
    if (!data) {
      if (help) help.textContent = "اقترب من محطة التمريض أو باب الغرفة أو جهاز المراقبة.";
      return;
    }
    onInteract(data, object);
  }

  canvas.addEventListener("click", event => {
    const object = sceneApi.pick(event.clientX, event.clientY);
    if (object) {
      select(object);
      const data = describe(object);
      if (data) onInteract(data, object);
    }
  });

  document.getElementById("interact-btn")?.addEventListener("click", interact);

  function update() {
    if (locationLabel) locationLabel.textContent = sceneApi.getLocation();
    const nearby = sceneApi.getNearby();
    if (nearby) select(nearby);
  }

  return { update, interact, select };
}
