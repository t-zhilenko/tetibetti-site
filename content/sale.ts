// Розпродаж речей: дані для сторінки /rozprodazh.
// Фото лежать у public/images/rozprodazh/<id>/<k>.jpg (1280px) і <k>-t.jpg (560px),
// k = 1..photos; перше фото = обкладинка. Джерело описів: нотатки проєкту
// «Розпродаж речей» у Teti Studio.
// Статус речі: без поля = в наявності; "reserved" = заброньовано (картка лишається,
// кнопки нема); "shipped" = відправлено (картка переїжджає вниз у «Продано»).

export type SaleCategory = "clothes" | "sport" | "lingerie" | "accessories";

export type SaleStatus = "available" | "reserved" | "shipped";

export type SaleItem = {
  id: string;
  title: string;
  size: string;
  price: number;
  priceRange: string;
  description: string;
  photos: number;
  category: SaleCategory;
  status?: SaleStatus;
};

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  available: "В наявності",
  reserved: "Заброньовано",
  shipped: "Відправлено",
};

export const saleStatus = (item: SaleItem): SaleStatus => item.status ?? "available";
export const isAvailable = (item: SaleItem) => saleStatus(item) === "available";

// Куди ведуть кнопки «Написати в Telegram». Має бути особистий акаунт, не канал.
export const SALE_TELEGRAM_USERNAME = "tzhilenko";

// Канал «Теті продає»: анонси нових речей і дропів.
export const SALE_CHANNEL_HANDLE = "tetiprodae";
export const SALE_CHANNEL_URL = `https://t.me/${SALE_CHANNEL_HANDLE}`;

export const SALE_CATEGORIES: {key: SaleCategory; label: string}[] = [
  {key: "clothes", label: "Одяг"},
  {key: "sport", label: "Спорт і зима"},
  {key: "lingerie", label: "Білизна й панчохи"},
  {key: "accessories", label: "Аксесуари і взуття"},
];

export const saleItems: SaleItem[] = [
  {
    id: "01",
    title: "Піжама Victoria's Secret, сорочка + штани",
    size: "S",
    price: 900,
    priceRange: "800–1000",
    description:
      "Атласна піжама Victoria's Secret: сорочка на ґудзиках і штани на резинці зі шнурком, білий фон, темно-сині крапки й монограма VS, кант по низу штанів. Розмір S (170/88A). На штанах є кілька дрібних затяжок, на фото видно, при носінні майже непомітно. Без плям.",
    photos: 11,
    category: "clothes",
  },
  {
    id: "02",
    title: "Снуд Maltina з ангорою, новий з біркою",
    size: "one size",
    price: 600,
    priceRange: "600",
    description:
      "Новий, з біркою. Теплий в'язаний снуд Maltina Accessories сірого кольору, застібається на магнітні кнопки. Склад: ангора, нейлон, віскоза, вовна. Дуже м'який, не колеться.",
    photos: 4,
    category: "accessories",
  },
  {
    id: "03",
    title: "Джинси Guess 1981 Skinny High, сірі",
    size: "26 (XS–S)",
    price: 800,
    priceRange: "700–900",
    description:
      "Сірі джинси Guess, модель 1981 Skinny High: висока посадка, вузький крій. Фірмовий трикутник на задній кишені. Носились акуратно, без потертостей.",
    photos: 7,
    category: "clothes",
  },
  {
    id: "04",
    title: "Худі-сорочка Сімпсони, ProSublim",
    size: "XXL, оверсайз",
    price: 600,
    priceRange: "500–700",
    description:
      "Яскрава кофта з капюшоном і повним принтом персонажів Сімпсонів, з коміром і застібкою спереду. Український бренд ProSublim, 100% поліестер, принт не тьмяніє після прання. На менші розміри сидить оверсайз. Для вечірок, фото, тематичних днів. Стан гарний.",
    photos: 7,
    category: "clothes",
  },
  {
    id: "05",
    title: "Спідниця-шорти DOM Drop of Mindfulness",
    size: "L",
    price: 500,
    priceRange: "400–600",
    description:
      "Чорна спортивна спідниця з вбудованими рожевими шортами, бренд Drop of Mindfulness (DOM). Бічні кулісні шнурки регулюють довжину. 80% поліамід, 20% еластан. Для тенісу, бігу, йоги. Стан відмінний.",
    photos: 8,
    category: "sport",
  },
  {
    id: "06",
    title: "Спортивний топ PINK Victoria's Secret",
    size: "S–M",
    price: 300,
    priceRange: "250–350",
    description:
      "Безшовний спортивний топ PINK від Victoria's Secret, ніжно-рожевий з написами PINK і монограмою. Спинка-борцівка, м'яка резинка. Безшовний, тягнеться. Стан гарний.",
    photos: 6,
    category: "sport",
  },
  {
    id: "07",
    title: "Мереживний бралет For Love & Lemons",
    size: "XS",
    price: 1300,
    priceRange: "1300",
    description:
      "Рожевий мереживний бралет-корсет For Love & Lemons з вишитими квітами і шнурівкою спереду, на бретелях. Designed in Los Angeles. Одягався кілька разів, стан як новий.",
    photos: 5,
    category: "lingerie",
  },
  {
    id: "08",
    title: "Пояс для панчіх Shur Shur x Zhilyova",
    size: "S",
    price: 1200,
    priceRange: "1200",
    description:
      "Дизайнерський пояс для панчіх Shur Shur x Zhilyova з регульованими підв'язками, білий з червоним оксамитом, застібка на гачки. 95% поліамід, 5% еластан. У фірмовій коробці. Стан як новий. Трусики в комплект не входять.",
    photos: 9,
    category: "lingerie",
  },
  {
    id: "09",
    title: "Джинси Levi's Premium High Slim Straight",
    size: "W25",
    price: 1050,
    priceRange: "900–1200",
    description:
      "Блакитні джинси Levi's Premium, лінійка Waterless, висока посадка, пряма звужена штанина. Класична шкіряна нашивка, червоний ярлик. Стан дуже гарний.",
    photos: 9,
    category: "clothes",
  },
  {
    id: "10",
    title: "Білі джинси Marc O'Polo, органічна бавовна",
    size: "уточню в чаті",
    price: 950,
    priceRange: "800–1100",
    description:
      "Білі джинси Marc O'Polo, 97% органічна бавовна, 3% еластан, пряма штанина, середня посадка. Без плям, стан відмінний.",
    photos: 8,
    category: "clothes",
  },
  {
    id: "11",
    title: "Лляні штани Zara на резинці, темно-сірі",
    size: "XS",
    price: 500,
    priceRange: "400–550",
    description:
      "Лляні штани Zara темно-сірого кольору, вільний крій, пояс на резинці зі шнурком, made in Morocco. Дихають у спеку, для офісу і прогулянок. Стан гарний.",
    photos: 4,
    category: "clothes",
  },
  {
    id: "12",
    title: "Стьобаний жилет Guess, бежевий",
    size: "XS",
    price: 1850,
    priceRange: "1500–2200",
    description:
      "Утеплений жилет Guess бежевого кольору з велюровим ефектом і тисненим логотипом, на блискавці, з кишенями. Атласна підкладка, фірмова металева табличка. Стан відмінний.",
    photos: 15,
    category: "clothes",
  },
  {
    id: "13",
    title: "Анорак DC Snowboarding, червоний",
    size: "L",
    price: 1850,
    priceRange: "1500–2200",
    description:
      "Сноубордична куртка-анорак DC, червона з чорним і білим, капюшон, півблискавка, кишеня на грудях, бічні блискавки для надягання. Утеплена підкладка. Стан гарний.",
    photos: 12,
    category: "sport",
  },
  {
    id: "14",
    title: "Лижні штани Rossignol з підтяжками",
    size: "XL",
    price: 2150,
    priceRange: "1800–2500",
    description:
      "Чорні гірськолижні штани Rossignol з відстібними підтяжками, регулюванням пояса на липучці, снігозахисними манжетами. 100% поліестер, made in Indonesia. Стан гарний.",
    photos: 15,
    category: "sport",
  },
  {
    id: "15",
    title: "Шкіряна сумка через плече, чорна",
    size: "вміщує планшет",
    price: 600,
    priceRange: "600",
    description:
      "Чорна сумка з натуральної шкіри через плече: клапан, блискавка, регульований ремінь, картата підкладка, задня кишеня на блискавці. По кутах шкіра трохи потерта, на фото видно; решта в гарному стані.",
    photos: 5,
    category: "accessories",
  },
  {
    id: "16",
    title: "Панчохи в'язані Shur Shur, чорні з червоним",
    size: "one size",
    price: 500,
    priceRange: "500",
    description:
      "В'язані панчохи вище коліна від українського бренду Shur Shur: чорні в рубчик з червоним верхом і фірмовою вишивкою. Стан гарний.",
    photos: 4,
    category: "lingerie",
    status: "shipped",
  },
  {
    id: "17",
    title: "Панчохи в'язані Shur Shur, сірі з синім",
    size: "one size",
    price: 500,
    priceRange: "500",
    description:
      "В'язані панчохи вище коліна Shur Shur: сірі в рубчик з синім верхом. Стан гарний.",
    photos: 4,
    category: "lingerie",
  },
  {
    id: "18",
    title: "Панчохи в'язані Shur Shur, рожеві",
    size: "one size",
    price: 500,
    priceRange: "500",
    description:
      "В'язані панчохи вище коліна Shur Shur, ніжно-рожеві в рубчик. Стан гарний.",
    photos: 4,
    category: "lingerie",
    status: "shipped",
  },
  {
    id: "19",
    title: "Стьобана куртка кремова, оверсайз",
    size: "XXL",
    price: 750,
    priceRange: "600–900",
    description:
      "Легка стьобана куртка кремового кольору з коміром-стійкою, кнопками і кишенями, оверсайз-крій. На менші розміри сидить як оверсайз. Стан гарний.",
    photos: 6,
    category: "clothes",
  },
  {
    id: "20",
    title: "Лляна сукня-вишиванка Linen Gallery",
    size: "UA 44 / EUR 38",
    price: 1850,
    priceRange: "1500–2200",
    description:
      "Лляна сукня Linen Gallery кольору індиго з вишивкою помаранчевими квітами на рукавах, подолі та по розрізах, пояс у комплекті. Українське виробництво. Одягалась кілька разів, стан як новий.",
    photos: 12,
    category: "clothes",
  },
  {
    id: "21",
    title: "Сукня-міді SHEIN, теракотова у цятку",
    size: "S",
    price: 300,
    priceRange: "250–350",
    description:
      "Сукня-міді SHEIN теракотового кольору з білими цятками, короткий рукав, комір-стійка, ґудзики, талія на резинці. Легка, для літа. Стан гарний.",
    photos: 8,
    category: "clothes",
  },
  {
    id: "22",
    title: "Туфлі-човники замшеві чорні",
    size: "37",
    price: 500,
    priceRange: "400–600",
    description:
      "Чорні замшеві туфлі-човники з гострим носком на невеликому стійкому підборі, дуже зручні на цілий день. Шкіряна устілка. Носились мало, підошва майже без зносу.",
    photos: 8,
    category: "accessories",
  },
];

export const saleItemPhoto = (item: SaleItem, k: number, thumb = false) =>
  `/images/rozprodazh/${item.id}/${k}${thumb ? "-t" : ""}.jpg`;

export const saleTelegramLink = (item: SaleItem) => {
  const text = `Привіт! Хочу купити з розпродажу №${item.id} ${item.title} (${item.price} грн).`;
  return `https://t.me/${SALE_TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
};
