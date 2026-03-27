import type { Locale } from './i18n';

const foodNames: Record<string, Record<string, string>> = {
  'Chicken Breast': { es: 'Pechuga de Pollo', fr: 'Blanc de Poulet', de: 'Hahnchenbrust', ar: 'صدر دجاج', zh: '鸡胸肉', ja: '鶏むね肉', ru: 'Куриная грудка' },
  'White Rice': { es: 'Arroz Blanco', fr: 'Riz Blanc', de: 'Weisser Reis', ar: 'أرز أبيض', zh: '白米饭', ja: '白米', ru: 'Белый рис' },
  'Eggs': { es: 'Huevos', fr: 'Oeufs', de: 'Eier', ar: 'بيض', zh: '鸡蛋', ja: '卵', ru: 'Яйца' },
  'Banana': { es: 'Platano', fr: 'Banane', de: 'Banane', ar: 'موز', zh: '香蕉', ja: 'バナナ', ru: 'Банан' },
  'Apple': { es: 'Manzana', fr: 'Pomme', de: 'Apfel', ar: 'تفاح', zh: '苹果', ja: 'りんご', ru: 'Яблоко' },
  'Whole Wheat Bread': { es: 'Pan Integral', fr: 'Pain Complet', de: 'Vollkornbrot', ar: 'خبز قمح كامل', zh: '全麦面包', ja: '全粒粉パン', ru: 'Цельнозерновой хлеб' },
  'Oatmeal': { es: 'Avena', fr: 'Flocons d\'Avoine', de: 'Haferflocken', ar: 'شوفان', zh: '燕麦片', ja: 'オートミール', ru: 'Овсянка' },
  'Salmon': { es: 'Salmon', fr: 'Saumon', de: 'Lachs', ar: 'سلمون', zh: '三文鱼', ja: 'サーモン', ru: 'Лосось' },
  'Broccoli': { es: 'Brocoli', fr: 'Brocoli', de: 'Brokkoli', ar: 'بروكلي', zh: '西兰花', ja: 'ブロッコリー', ru: 'Брокколи' },
  'Milk (Whole)': { es: 'Leche Entera', fr: 'Lait Entier', de: 'Vollmilch', ar: 'حليب كامل', zh: '全脂牛奶', ja: '全乳', ru: 'Молоко цельное' },
  'Greek Yogurt': { es: 'Yogur Griego', fr: 'Yaourt Grec', de: 'Griechischer Joghurt', ar: 'زبادي يوناني', zh: '希腊酸奶', ja: 'ギリシャヨーグルト', ru: 'Греческий йогурт' },
  'Pasta': { es: 'Pasta', fr: 'Pates', de: 'Nudeln', ar: 'معكرونة', zh: '意面', ja: 'パスタ', ru: 'Паста' },
  'Potato': { es: 'Patata', fr: 'Pomme de Terre', de: 'Kartoffel', ar: 'بطاطس', zh: '土豆', ja: 'じゃがいも', ru: 'Картофель' },
  'Sweet Potato': { es: 'Batata', fr: 'Patate Douce', de: 'Susskartoffel', ar: 'بطاطا حلوة', zh: '红薯', ja: 'さつまいも', ru: 'Батат' },
  'Avocado': { es: 'Aguacate', fr: 'Avocat', de: 'Avocado', ar: 'أفوكادو', zh: '牛油果', ja: 'アボカド', ru: 'Авокадо' },
  'Almonds': { es: 'Almendras', fr: 'Amandes', de: 'Mandeln', ar: 'لوز', zh: '杏仁', ja: 'アーモンド', ru: 'Миндаль' },
  'Beef (Ground)': { es: 'Carne Molida', fr: 'Boeuf Hache', de: 'Rinderhackfleisch', ar: 'لحم بقري مفروم', zh: '牛肉末', ja: '牛ひき肉', ru: 'Говяжий фарш' },
  'Turkey Breast': { es: 'Pechuga de Pavo', fr: 'Blanc de Dinde', de: 'Putenbrust', ar: 'صدر ديك رومي', zh: '火鸡胸肉', ja: '七面鳥胸肉', ru: 'Грудка индейки' },
  'Tuna': { es: 'Atun', fr: 'Thon', de: 'Thunfisch', ar: 'تونة', zh: '金枪鱼', ja: 'マグロ', ru: 'Тунец' },
  'Spinach': { es: 'Espinacas', fr: 'Epinards', de: 'Spinat', ar: 'سبانخ', zh: '菠菜', ja: 'ほうれん草', ru: 'Шпинат' },
  'Carrots': { es: 'Zanahorias', fr: 'Carottes', de: 'Karotten', ar: 'جزر', zh: '胡萝卜', ja: 'にんじん', ru: 'Морковь' },
  'Tomato': { es: 'Tomate', fr: 'Tomate', de: 'Tomate', ar: 'طماطم', zh: '番茄', ja: 'トマト', ru: 'Помидор' },
  'Orange': { es: 'Naranja', fr: 'Orange', de: 'Orange', ar: 'برتقال', zh: '橙子', ja: 'オレンジ', ru: 'Апельсин' },
  'Peanut Butter': { es: 'Mantequilla de Mani', fr: 'Beurre de Cacahuete', de: 'Erdnussbutter', ar: 'زبدة فول سوداني', zh: '花生酱', ja: 'ピーナッツバター', ru: 'Арахисовая паста' },
  'Quinoa': { es: 'Quinoa', fr: 'Quinoa', de: 'Quinoa', ar: 'كينوا', zh: '藜麦', ja: 'キヌア', ru: 'Киноа' },
  'Lentils': { es: 'Lentejas', fr: 'Lentilles', de: 'Linsen', ar: 'عدس', zh: '扁豆', ja: 'レンズ豆', ru: 'Чечевица' },
  'Tofu': { es: 'Tofu', fr: 'Tofu', de: 'Tofu', ar: 'توفو', zh: '豆腐', ja: '豆腐', ru: 'Тофу' },
  'Brown Rice': { es: 'Arroz Integral', fr: 'Riz Complet', de: 'Brauner Reis', ar: 'أرز بني', zh: '糙米', ja: '玄米', ru: 'Бурый рис' },
  'Cottage Cheese': { es: 'Requeson', fr: 'Fromage Blanc', de: 'Huttenkase', ar: 'جبن قريش', zh: '农家干酪', ja: 'カッテージチーズ', ru: 'Творог' },
  'Honey': { es: 'Miel', fr: 'Miel', de: 'Honig', ar: 'عسل', zh: '蜂蜜', ja: 'はちみつ', ru: 'Мёд' },
  'Olive Oil': { es: 'Aceite de Oliva', fr: 'Huile d\'Olive', de: 'Olivenol', ar: 'زيت زيتون', zh: '橄榄油', ja: 'オリーブオイル', ru: 'Оливковое масло' },
  'Dark Chocolate': { es: 'Chocolate Negro', fr: 'Chocolat Noir', de: 'Dunkle Schokolade', ar: 'شوكولاتة داكنة', zh: '黑巧克力', ja: 'ダークチョコレート', ru: 'Тёмный шоколад' },
  'Green Beans': { es: 'Judias Verdes', fr: 'Haricots Verts', de: 'Grune Bohnen', ar: 'فاصوليا خضراء', zh: '四季豆', ja: 'さやいんげん', ru: 'Стручковая фасоль' },
  'Corn': { es: 'Maiz', fr: 'Mais', de: 'Mais', ar: 'ذرة', zh: '玉米', ja: 'とうもろこし', ru: 'Кукуруза' },
  'Mushrooms': { es: 'Champiñones', fr: 'Champignons', de: 'Pilze', ar: 'فطر', zh: '蘑菇', ja: 'きのこ', ru: 'Грибы' },
  'Cucumber': { es: 'Pepino', fr: 'Concombre', de: 'Gurke', ar: 'خيار', zh: '黄瓜', ja: 'きゅうり', ru: 'Огурец' },
  'Lettuce': { es: 'Lechuga', fr: 'Laitue', de: 'Kopfsalat', ar: 'خس', zh: '生菜', ja: 'レタス', ru: 'Салат' },
  'Watermelon': { es: 'Sandia', fr: 'Pasteque', de: 'Wassermelone', ar: 'بطيخ', zh: '西瓜', ja: 'スイカ', ru: 'Арбуз' },
  'Strawberry': { es: 'Fresa', fr: 'Fraise', de: 'Erdbeere', ar: 'فراولة', zh: '草莓', ja: 'いちご', ru: 'Клубника' },
  'Mango': { es: 'Mango', fr: 'Mangue', de: 'Mango', ar: 'مانجو', zh: '芒果', ja: 'マンゴー', ru: 'Манго' },
  'Shrimp': { es: 'Camarones', fr: 'Crevettes', de: 'Garnelen', ar: 'جمبري', zh: '虾', ja: 'エビ', ru: 'Креветки' },
  'Ham': { es: 'Jamon', fr: 'Jambon', de: 'Schinken', ar: 'لحم خنزير', zh: '火腿', ja: 'ハム', ru: 'Ветчина' },
  'Cheese (Cheddar)': { es: 'Queso Cheddar', fr: 'Fromage Cheddar', de: 'Cheddar-Kase', ar: 'جبن شيدر', zh: '切达奶酪', ja: 'チェダーチーズ', ru: 'Сыр чеддер' },
  'Butter': { es: 'Mantequilla', fr: 'Beurre', de: 'Butter', ar: 'زبدة', zh: '黄油', ja: 'バター', ru: 'Сливочное масло' },
  'Blueberries': { es: 'Arandanos', fr: 'Myrtilles', de: 'Blaubeeren', ar: 'توت أزرق', zh: '蓝莓', ja: 'ブルーベリー', ru: 'Голубика' },
  'Chickpeas': { es: 'Garbanzos', fr: 'Pois Chiches', de: 'Kichererbsen', ar: 'حمص', zh: '鹰嘴豆', ja: 'ひよこ豆', ru: 'Нут' },
  'Pineapple': { es: 'Piña', fr: 'Ananas', de: 'Ananas', ar: 'أناناس', zh: '菠萝', ja: 'パイナップル', ru: 'Ананас' },
  'White Bread': { es: 'Pan Blanco', fr: 'Pain Blanc', de: 'Weissbrot', ar: 'خبز أبيض', zh: '白面包', ja: '白パン', ru: 'Белый хлеб' },
  'Yogurt (Plain)': { es: 'Yogur Natural', fr: 'Yaourt Nature', de: 'Naturjoghurt', ar: 'زبادي سادة', zh: '原味酸奶', ja: 'プレーンヨーグルト', ru: 'Йогурт натуральный' },
  'Granola': { es: 'Granola', fr: 'Granola', de: 'Granola', ar: 'جرانولا', zh: '格兰诺拉', ja: 'グラノーラ', ru: 'Гранола' },
};

const categoryNames: Record<string, Record<string, string>> = {
  'Protein': { es: 'Proteinas', fr: 'Proteines', de: 'Protein', ar: 'بروتين', zh: '蛋白质', ja: 'タンパク質', ru: 'Белок' },
  'Grains': { es: 'Cereales', fr: 'Cereales', de: 'Getreide', ar: 'حبوب', zh: '谷物', ja: '穀物', ru: 'Злаки' },
  'Fruits': { es: 'Frutas', fr: 'Fruits', de: 'Obst', ar: 'فواكه', zh: '水果', ja: '果物', ru: 'Фрукты' },
  'Vegetables': { es: 'Verduras', fr: 'Legumes', de: 'Gemuse', ar: 'خضروات', zh: '蔬菜', ja: '野菜', ru: 'Овощи' },
  'Dairy': { es: 'Lacteos', fr: 'Produits Laitiers', de: 'Milchprodukte', ar: 'ألبان', zh: '乳制品', ja: '乳製品', ru: 'Молочные' },
  'Nuts': { es: 'Frutos Secos', fr: 'Noix', de: 'Nusse', ar: 'مكسرات', zh: '坚果', ja: 'ナッツ', ru: 'Орехи' },
  'Legumes': { es: 'Legumbres', fr: 'Legumineuses', de: 'Hulsenfruchte', ar: 'بقوليات', zh: '豆类', ja: '豆類', ru: 'Бобовые' },
  'Sweeteners': { es: 'Endulzantes', fr: 'Edulcorants', de: 'Sussmittel', ar: 'محليات', zh: '甜味剂', ja: '甘味料', ru: 'Подсластители' },
  'Fats': { es: 'Grasas', fr: 'Matieres Grasses', de: 'Fette', ar: 'دهون', zh: '油脂', ja: '油脂', ru: 'Жиры' },
  'Snacks': { es: 'Snacks', fr: 'En-cas', de: 'Snacks', ar: 'وجبات خفيفة', zh: '零食', ja: 'おやつ', ru: 'Закуски' },
};

export function translateFood(name: string, locale: Locale): string {
  if (locale === 'en') return name;
  return foodNames[name]?.[locale] || name;
}

export function translateCategory(category: string, locale: Locale): string {
  if (locale === 'en') return category;
  return categoryNames[category]?.[locale] || category;
}
