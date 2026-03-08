const messages: Record<string, string> = {};

messages.SENSOREN_CATEGORY = "Датчики";
messages.ACTUATOREN_CATEGORY = "Актуатори";
messages.ADD_COMMENT = "Додати коментар";
messages.ARD_ANALOGWRITE = "Встановити пін PWM";
messages.ARD_DIGITALWRITE = "Встановити цифровий пін";
messages.ARD_SET_MULTIPLEXER = "Встановити цифровий мультиплексор на пін";
messages.ARD_PIN_WARN1 =
	"Пін %1 необхідний для %2 як пін %3. Вже використовується як %4.";
messages.ARD_SERVO_READ = "Зчитати пін сервоприводу";
messages.ARD_SERVO_REGULAR_WRITE = "Встановити пін сервоприводу";
messages.ARD_SERVO_ARM_WRITE = "Встановити пін сервоприводу маніпулятора";
messages.ARD_SERVO_WRITE = "Встановити пін серво";
messages.ARD_SERVO_WRITE_DEG_180 = "градусів";
messages.ARD_SERVO_WRITE_TO = "кут на";
messages.ARD_TIME_DELAY = "Зачекати";
messages.ARD_TIME_DELAY_TIP = "Зачекати вказаний час у мілі/мікросекундах";
messages.ARD_WRITE_TO = "До";
messages.CANNOT_DELETE_VARIABLE_PROCEDURE =
	"Неможливо видалити змінну '%1', оскільки вона є частиною визначення функції '%2'";
messages.CHANGE_VALUE_TITLE = "Змінити значення:";
messages.CLEAN_UP = "Упорядкувати блоки";
messages.COLLAPSED_WARNINGS_WARNING = "Згорнуті блоки містять попередження.";
messages.COLLAPSE_ALL = "Згорнути блоки";
messages.COLLAPSE_BLOCK = "Згорнути блок";
messages.COLOUR_BLEND_COLOUR1 = "колір 1";
messages.COLOUR_BLEND_COLOUR2 = "колір 2";
messages.COLOUR_BLEND_HELPURL =
	"https://meyerweb.com/eric/tools/color-blend/#:::rgbp";
messages.COLOUR_BLEND_RATIO = "співвідношення";
messages.COLOUR_BLEND_TITLE = "змішати";
messages.COLOUR_BLEND_TOOLTIP =
	"Змішує два кольори разом у заданому співвідношенні (0.0 - 1.0).";
messages.COLOUR_PICKER_HELPURL = "https://uk.wikipedia.org/wiki/Колір";
messages.COLOUR_PICKER_TOOLTIP = "Виберіть колір з палітри.";
messages.COLOUR_RANDOM_HELPURL = "http://randomcolour.com";
messages.COLOUR_RANDOM_TITLE = "випадковий колір";
messages.COLOUR_RANDOM_TOOLTIP = "Вибрати випадковий колір.";
messages.COLOUR_RGB_BLUE = "синій";
messages.COLOUR_RGB_GREEN = "зелений";
messages.COLOUR_RGB_HELPURL =
	"https://www.december.com/html/spec/colorpercompact.html";
messages.COLOUR_RGB_RED = "червоний";
messages.COLOUR_RGB_AMBIENT = "освітлення";
messages.COLOUR_RGB_TITLE = "колір з";
messages.COLOUR_RGB_TOOLTIP =
	"Створити колір із заданою кількістю червоного, зеленого та синього. Всі значення мають бути від 0 до 100.";
messages.CONTROLS_FLOW_STATEMENTS_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#loop-termination-blocks";
messages.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK = "перервати цикл";
messages.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE =
	"продовжити з наступної ітерації циклу";
messages.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK = "Вийти з поточного циклу.";
messages.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE =
	"Пропустити решту цього циклу та перейти до наступної ітерації.";
messages.CONTROLS_FLOW_STATEMENTS_WARNING =
	"Попередження: Цей блок можна використовувати лише в межах циклу.";
messages.CONTROLS_FOREACH_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#for-each";
messages.CONTROLS_FOREACH_TITLE = "для кожного елемента %1 у списку %2";
messages.CONTROLS_FOREACH_TOOLTIP =
	"Для кожного елемента в списку встановити змінну '%1' для цього елемента, а потім виконати певні дії.";
messages.CONTROLS_FOR_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#count-with";
messages.CONTROLS_FOR_TITLE = "рахувати з %1 від %2 до %3 через %4";
messages.CONTROLS_FOR_TOOLTIP =
	"Змінна '%1' набуває значень від початкового до кінцевого з заданим інтервалом, виконуючи вказані блоки.";
messages.CONTROLS_IF_ELSEIF_TOOLTIP = "Додати умову до блоку 'якщо'.";
messages.CONTROLS_IF_ELSE_TOOLTIP =
	"Додати останню всеосяжну умову до блоку 'якщо'.";
messages.CONTROLS_IF_HELPURL = "https://github.com/google/blockly/wiki/IfElse";
messages.CONTROLS_IF_IF_TOOLTIP =
	"Додайте, видаліть або змініть порядок розділів, щоб переналаштувати цей блок 'якщо'.";
messages.CONTROLS_IF_MSG_ELSE = "інакше";
messages.CONTROLS_IF_MSG_ELSEIF = "інакше якщо";
messages.CONTROLS_MULTIPLEXER_1 = "Встановити мультиплексор на";
messages.CONTROLS_MULTIPLEXER_2 = "потім виконати";
messages.CONTROLS_IF_MSG_IF = "якщо";
messages.CONTROLS_IF_MSG_THEN = "тоді";
messages.CONTROLS_IF_TOOLTIP_1 = "Якщо значення істинне, виконати певні дії.";
messages.CONTROLS_IF_TOOLTIP_2 =
	"Якщо значення істинне, виконати перший блок дій. В іншому випадку виконати другий блок дій.";
messages.CONTROLS_IF_TOOLTIP_3 =
	"Якщо перше значення істинне, виконати перший блок дій. В іншому випадку, якщо друге значення істинне, виконати другий блок дій.";
messages.CONTROLS_IF_TOOLTIP_4 =
	"Якщо перше значення істинне, виконати перший блок дій. В іншому випадку, якщо друге значення істинне, виконати другий блок дій. Якщо жодне зі значень не є істинним, виконати останній блок дій.";
messages.CONTROLS_REPEAT_FOREVER_TITLE = "повторювати нескінченно";
messages.CONTROLS_REPEAT_HELPURL = "https://uk.wikipedia.org/wiki/Цикл_for";
messages.CONTROLS_REPEAT_INPUT_DO = "";
messages.CONTROLS_REPEAT_TITLE = "повторити %1 разів";
messages.CONTROLS_REPEAT_TOOLTIP = "Виконати певні дії кілька разів.";
messages.CONTROLS_WHILEUNTIL_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#repeat";
messages.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL = "повторювати доки не";
messages.CONTROLS_WHILEUNTIL_OPERATOR_WHILE = "повторювати поки";
messages.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL =
	"Поки значення хибне, виконувати певні дії.";
messages.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE =
	"Поки значення істинне, виконувати певні дії.";
messages.DELETE_ALL_BLOCKS = "Видалити всі %1 блоки?";
messages.DELETE_BLOCK = "Видалити блок";
messages.DELETE_VARIABLE = "Видалити змінну '%1'";
messages.DELETE_VARIABLE_CONFIRMATION = "Видалити %1 використань змінної '%2'?";
messages.DELETE_X_BLOCKS = "Видалити %1 блоків";
messages.DIALOG_CANCEL = "Скасувати";
messages.DIALOG_OK = "OK";
messages.DISABLE_BLOCK = "Вимкнути блок";
messages.DUPLICATE_BLOCK = "Дублювати";
messages.DUPLICATE_COMMENT = "Дублювати коментар";
messages.ENABLE_BLOCK = "Увімкнути блок";
messages.EXPAND_ALL = "Розгорнути блоки";
messages.EXPAND_BLOCK = "Розгорнути блок";
messages.EXTERNAL_INPUTS = "Зовнішні входи";
messages.HELP = "Довідка";
messages.INLINE_INPUTS = "Внутрішні входи";
messages.LEAPHY_ANALOG_READ = "Зчитати аналоговий пін";
messages.LEAPHY_BUZZ_BUZZ = "Гудок";
messages.LEAPHY_BUZZ_HERTZ = "Герц";
messages.LEAPHY_BUZZ_MS = "мс";
messages.LEAPHY_CLICK_CATEGORY = "Leaphy Click";
messages.LEAPHY_DIGITAL_READ = "Зчитати цифровий пін";
messages.LEAPHY_CHOOSE_GAS = "Зчитати газ";
messages.LEAPHY_DISPLAY_CLEAR = "Очистити дисплей";
messages.LEAPHY_DISPLAY_DISPLAY = "Показати на дисплеї";
messages.LEAPHY_DISPLAY_PRINT = "Дисплей - Вст. рядок";
messages.LEAPHY_DISPLAY_SET_TEXT_SIZE = "Встановити розмір тексту";
messages.LEAPHY_DISPLAY_LARGE_CLEAR = "Очистити великий дисплей";
messages.LEAPHY_DISPLAY_LARGE_DISPLAY = "Показати на великому дисплеї";
messages.LEAPHY_DISPLAY_LARGE_PRINT = "Великий дисплей - Вст. рядок";
messages.LEAPHY_DISPLAY_LARGE_SET_TEXT_SIZE =
	"Встановити розмір тексту великого дисплея";
messages.LEAPHY_EXTRA_CATEGORY = "Leaphy Extra";
messages.LEAPHY_FLITZ_CATEGORY = "Leaphy Flitz";
messages.LEAPHY_FLITZ_LED = "Підсвітка носа - ";
messages.LEAPHY_FLITZ_LED_B = "Синій";
messages.LEAPHY_FLITZ_LED_G = "Зелений";
messages.LEAPHY_FLITZ_LED_R = "Червоний";
messages.LEAPHY_FUNCTIONS_CATEGORY = "Власні блоки";
messages.LEAPHY_GET_DISTANCE = "Отримати відстань";
messages.LEAPHY_TOF_GET_DISTANCE = "Отримати ToF";
messages.LEAPHY_GET_AIR_PRESSURE = "Отримати тиск повітря";
messages.LEAPHY_TMP102_READ_TEMPERATURE = "Зчитати температуру";
messages.LEAPHY_DHT22_READ_TEMPERATURE = "Зчитати температуру з DHT22 на піні";
messages.LEAPHY_DHT22_READ_HUMIDITY = "Зчитати вологість з DHT22 на піні";
messages.LEAPHY_GET_GESTURE = "Отримати жест";
messages.LEAPHY_LED = "Світлодіод";
messages.LEAPHY_LED_BASIC_BLUE = "B";
messages.LEAPHY_LED_BASIC_GREEN = "G";
messages.LEAPHY_LED_BASIC_LED = "Базова LED-стрічка - Світлодіод";
messages.LEAPHY_LED_BASIC_RED = "R";
messages.LEAPHY_LED_BLUE = "Синій";
messages.LEAPHY_LED_GREEN = "Зелений";
messages.LEAPHY_LED_RED = "Червоний";
messages.LEAPHY_LED_SET_LEDS = "Світлодіоди";
messages.LEAPHY_LED_SET_PIN = "Пін";
messages.LEAPHY_LED_SET_SPEEDVALUE = "Демо LED-стрічки - Швидкість";
messages.LEAPHY_LED_SET_STRIP = "Встановити LED-стрічку";
messages.LEAPHY_LED_STRIP_BREATHE = "Дихання";
messages.LEAPHY_LED_STRIP_COLORGULF = "Кольорова хвиля";
messages.LEAPHY_LED_STRIP_DEMO = "Демо LED-стрічки";
messages.LEAPHY_LED_STRIP_GULF = "Хвиля";
messages.LEAPHY_LED_STRIP_LIGHTBANK = "Світлова панель";
messages.LEAPHY_LED_STRIP_RAINBOW = "Веселка";
messages.LEAPHY_MOTOR_A_DROPDOWN = "Мотор_A";
messages.LEAPHY_MOTOR_BACKWARD = "Назад";
messages.LEAPHY_MOTOR_B_DROPDOWN = "Мотор_B";
messages.LEAPHY_MOTOR_DIRECTION = "Напрямок";
messages.LEAPHY_MOTOR_FORWARD = "Вперед";
messages.LEAPHY_MOTOR_LEFT = "Ліворуч";
messages.LEAPHY_MOTOR_LEFT_DROPDOWN = "Мотор_L";
messages.LEAPHY_MOTOR_RIGHT = "Праворуч";
messages.LEAPHY_MOTOR_RIGHT_DROPDOWN = "Мотор_R";
messages.LEAPHY_MOTOR_SPEED = "Швидкість";
messages.LEAPHY_MOTOR_TYPE = "Тип";
messages.LEAPHY_SERVO_SET = "Серво %1 зі швидкістю %2";
messages.LEAPHY_SERVO_MOVE = "Напрямок серво %1 зі швидкістю %2";
messages.LEAPHY_NUMBERS_CATEGORY = "Числа";
messages.LEAPHY_OPERATORS_CATEGORY = "Оператори";
messages.LEAPHY_ORIGINAL_CATEGORY = "Leaphy Original";
messages.LEAPHY_READ_HAND = "Зчитати датчик руки";
messages.LEAPHY_READ_STOMACH = "Зчитати датчик живота";
messages.LEAPHY_RGB_COLOR_BLUE = "Колір B-255";
messages.LEAPHY_RGB_COLOR_GREEN = "Колір G-255";
messages.LEAPHY_RGB_COLOR_RED = "Колір R-255";
messages.LEAPHY_RGB_RAW_COLOR_BLUE = "Синій (сирий)";
messages.LEAPHY_RGB_RAW_COLOR_GREEN = "Зелений (сирий)";
messages.LEAPHY_RGB_RAW_COLOR_RED = "Червоний (сирий)";
messages.LEAPHY_RGB_READ_SENSOR = "Зчитати RGB датчик";
messages.LEAPHY_SERIAL_PRINT = "Показати на екрані";
messages.LEAPHY_SERIAL_AVAILABLE = "Доступно на екрані";
messages.LEAPHY_SERIAL_READ_LINE = "Читати з екрана";
messages.LEAPHY_SITUATION_CATEGORY = "Логіка потоку";
messages.LEAPHY_SONAR_READ_ECHO = "Ехо";
messages.LEAPHY_SONAR_READ_TRIG = "Отримати відстань Trig";
messages.LEAPHY_START = "Leaphy";
messages.LEAPHY_STOMACH_SENSOR_TYPE1 = "Тип 1";
messages.LEAPHY_STOMACH_SENSOR_TYPE2 = "Тип 2";
messages.LEAPHY_UNO_CATEGORY = "Arduino Uno";
messages.LEAPHY_VARIABLES_CATEGORY = "Змінні";
messages.LEAPHY_LISTS_CATEGORY = "Списки";
messages.LEAPHY_LISTS_ADD = "додати %1 до %2";
messages.LEAPHY_LISTS_DELETE = "видалити %1 з %2";
messages.LEAPHY_LISTS_CLEAR = "видалити все з %1";
messages.LEAPHY_LISTS_INSERT = "вставити %1 у %2 з %3";
messages.LEAPHY_LISTS_REPLACE = "замінити %1 у %2 на %3";
messages.LEAPHY_LISTS_GET = "отримати %1 з %2";
messages.LEAPHY_LISTS_LENGTH = "довжина %1";
messages.LOGIC_BOOLEAN_FALSE = "хибність";
messages.LOGIC_BOOLEAN_HELPURL =
	"https://github.com/google/blockly/wiki/Logic#values";
messages.LOGIC_BOOLEAN_TOOLTIP = "Повертає значення 'істина' або 'хибність'.";
messages.LOGIC_BOOLEAN_TRUE = "істина";
messages.LOGIC_COMPARE_HELPURL = "https://uk.wikipedia.org/wiki/Нерівність";
messages.LOGIC_COMPARE_TOOLTIP_EQ =
	"Повертає 'істина', якщо обидва входи рівні один одному.";
messages.LOGIC_COMPARE_TOOLTIP_GT =
	"Повертає 'істина', якщо перший вхід більший за другий.";
messages.LOGIC_COMPARE_TOOLTIP_GTE =
	"Повертає 'істина', якщо перший вхід більший або рівний другому.";
messages.LOGIC_COMPARE_TOOLTIP_LT =
	"Повертає 'істина', якщо перший вхід менший за другий.";
messages.LOGIC_COMPARE_TOOLTIP_LTE =
	"Повертає 'істина', якщо перший вхід менший або рівний другому.";
messages.LOGIC_COMPARE_TOOLTIP_NEQ =
	"Повертає 'істина', якщо обидва входи не рівні один одному.";
messages.LOGIC_NEGATE_HELPURL =
	"https://github.com/google/blockly/wiki/Logic#not";
messages.LOGIC_NEGATE_TITLE = "не %1";
messages.LOGIC_NEGATE_TOOLTIP =
	"Повертає 'істина', якщо вхід хибний. Повертає 'хибність', якщо вхід істинний.";
messages.LOGIC_NULL = "ніщо";
messages.LOGIC_NULL_HELPURL = "https://uk.wikipedia.org/wiki/Nullable_type";
messages.LOGIC_NULL_TOOLTIP = "Повертає порожнє значення (null).";
messages.LOGIC_OPERATION_AND = "та";
messages.LOGIC_OPERATION_HELPURL =
	"https://github.com/google/blockly/wiki/Logic#logical-operations";
messages.LOGIC_OPERATION_OR = "або";
messages.LOGIC_OPERATION_TOOLTIP_AND =
	"Повертає 'істина', якщо обидва входи істинні.";
messages.LOGIC_OPERATION_TOOLTIP_OR =
	"Повертає 'істина', якщо хоча б один із входів істинний.";
messages.LOGIC_TERNARY_CONDITION = "тест";
messages.LOGIC_TERNARY_HELPURL =
	"https://uk.wikipedia.org/wiki/Тернарна_умовна_операція";
messages.LOGIC_TERNARY_IF_FALSE = "якщо хибність";
messages.LOGIC_TERNARY_IF_TRUE = "якщо істина";
messages.LOGIC_TERNARY_TOOLTIP =
	"Перевірте умову в 'тест'. Якщо умова істинна, повертає значення 'якщо істина'; в іншому випадку повертає значення 'якщо хибність'.";
messages.MATH_ADDITION_SYMBOL = "+";
messages.MATH_ARITHMETIC_HELPURL = "https://uk.wikipedia.org/wiki/Арифметика";
messages.MATH_ARITHMETIC_TOOLTIP_ADD = "Повертає суму двох чисел.";
messages.MATH_ARITHMETIC_TOOLTIP_DIVIDE = "Повертає частку двох чисел.";
messages.MATH_ARITHMETIC_TOOLTIP_MINUS = "Повертає різницю двох чисел.";
messages.MATH_ARITHMETIC_TOOLTIP_MULTIPLY = "Повертає добуток двох чисел.";
messages.MATH_ARITHMETIC_TOOLTIP_POWER =
	"Повертає перше число, піднесене до степеня другого числа.";
messages.MATH_ATAN2_HELPURL = "https://uk.wikipedia.org/wiki/Atan2";
messages.MATH_ATAN2_TITLE = "atan2 X:%1 Y:%2";
messages.MATH_ATAN2_TOOLTIP =
	"Повертає арктангенс точки (X, Y) у градусах від -180 до 180.";
messages.MATH_CHANGE_HELPURL = "https://uk.wikipedia.org/wiki/Інкремент";
messages.MATH_CHANGE_TITLE = "змінити %1 на %2";
messages.MATH_CHANGE_TOOLTIP = "Додати число до змінної '%1'.";
messages.MATH_CONSTANT_HELPURL =
	"https://uk.wikipedia.org/wiki/Математична_константа";
messages.MATH_CONSTANT_TOOLTIP =
	"Повертає одну з поширених констант: π (3.141…), e (2.718…), φ (1.618…), sqrt(2) (1.414…), sqrt(½) (0.707…), або ∞ (нескінченність).";
messages.MATH_CONSTRAIN_HELPURL =
	"https://en.wikipedia.org/wiki/Clamping_(graphics)";
messages.MATH_CONSTRAIN_TITLE = "обмежити %1 знизу %2 зверху %3";
messages.MATH_CONSTRAIN_TOOLTIP = "Обмежити число в заданих межах (включно).";
messages.MATH_DIVISION_SYMBOL = "÷";
messages.MATH_IS_DIVISIBLE_BY = "ділиться на";
messages.MATH_IS_EVEN = "є парним";
messages.MATH_IS_NEGATIVE = "є від’ємним";
messages.MATH_IS_ODD = "є непарним";
messages.MATH_IS_POSITIVE = "є додатним";
messages.MATH_IS_PRIME = "є простим";
messages.MATH_IS_TOOLTIP =
	"Перевіряє, чи є число парним, непарним, простим, цілим, додатним, від’ємним або чи ділиться воно на певне число. Повертає 'істина' або 'хибність'.";
messages.MATH_IS_WHOLE = "є цілим";
messages.MATH_MODULO_HELPURL =
	"https://uk.wikipedia.org/wiki/Остача_від_ділення";
messages.MATH_MODULO_TITLE = "остача від %1 ÷ %2";
messages.MATH_MODULO_TOOLTIP = "Повертає остачу від ділення двох чисел.";
messages.MATH_MULTIPLICATION_SYMBOL = "×";
messages.MATH_NUMBER_HELPURL = "https://uk.wikipedia.org/wiki/Число";
messages.MATH_NUMBER_TOOLTIP = "Число.";
messages.MATH_ONLIST_HELPURL = "";
messages.MATH_ONLIST_OPERATOR_AVERAGE = "середнє списку";
messages.MATH_ONLIST_OPERATOR_MAX = "максимум списку";
messages.MATH_ONLIST_OPERATOR_MEDIAN = "медіана списку";
messages.MATH_ONLIST_OPERATOR_MIN = "мінімум списку";
messages.MATH_ONLIST_OPERATOR_MODE = "моди списку";
messages.MATH_ONLIST_OPERATOR_RANDOM = "випадковий елемент списку";
messages.MATH_ONLIST_OPERATOR_STD_DEV = "стандартне відхилення списку";
messages.MATH_ONLIST_OPERATOR_SUM = "сума списку";
messages.MATH_ONLIST_TOOLTIP_AVERAGE =
	"Повертає середнє арифметичне числових значень у списку.";
messages.MATH_ONLIST_TOOLTIP_MAX = "Повертає найбільше число у списку.";
messages.MATH_ONLIST_TOOLTIP_MEDIAN = "Повертає медіану списку.";
messages.MATH_ONLIST_TOOLTIP_MIN = "Повертає найменше число у списку.";
messages.MATH_ONLIST_TOOLTIP_MODE =
	"Повертає список найбільш часто зустрічуваних елементів у списку.";
messages.MATH_ONLIST_TOOLTIP_RANDOM = "Повертає випадковий елемент зі списку.";
messages.MATH_ONLIST_TOOLTIP_STD_DEV = "Повертає стандартне відхилення списку.";
messages.MATH_ONLIST_TOOLTIP_SUM = "Повертає суму всіх чисел у списку.";
messages.MATH_POWER_SYMBOL = "^";
messages.MATH_RANDOM_FLOAT_HELPURL =
	"https://uk.wikipedia.org/wiki/Генератор_випадкових_чисел";
messages.MATH_RANDOM_FLOAT_TITLE_RANDOM = "випадковий дріб";
messages.MATH_RANDOM_FLOAT_TOOLTIP =
	"Повертає випадковий дріб від 0.0 (включно) до 1.0 (виключно).";
messages.MATH_RANDOM_INT_HELPURL =
	"https://uk.wikipedia.org/wiki/Генератор_випадкових_чисел";
messages.MATH_RANDOM_INT_TITLE = "випадкове ціле від %1 до %2";
messages.MATH_RANDOM_INT_TOOLTIP =
	"Повертає випадкове ціле число між двома заданими межами, включно.";
messages.MATH_ROUND_HELPURL = "https://uk.wikipedia.org/wiki/Округлення";
messages.MATH_ROUND_OPERATOR_ROUND = "округлити";
messages.MATH_ROUND_OPERATOR_ROUNDDOWN = "округлити до меншого";
messages.MATH_ROUND_OPERATOR_ROUNDUP = "округлити до більшого";
messages.MATH_ROUND_TOOLTIP = "Округлити число вгору або вниз.";
messages.MATH_SINGLE_HELPURL =
	"https://uk.wikipedia.org/wiki/Квадратний_корінь";
messages.MATH_SINGLE_OP_ABSOLUTE = "модуль";
messages.MATH_SINGLE_OP_ROOT = "квадратний корінь";
messages.MATH_SINGLE_TOOLTIP_ABS = "Повертає модуль числа.";
messages.MATH_SINGLE_TOOLTIP_EXP = "Повертає e у степені числа.";
messages.MATH_SINGLE_TOOLTIP_LN = "Повертає натуральний логарифм числа.";
messages.MATH_SINGLE_TOOLTIP_LOG10 = "Повертає десятковий логарифм числа.";
messages.MATH_SINGLE_TOOLTIP_NEG =
	"Повертає заперечення числа (з протилежним знаком).";
messages.MATH_SINGLE_TOOLTIP_POW10 = "Повертає 10 у степені числа.";
messages.MATH_SINGLE_TOOLTIP_ROOT = "Повертає квадратний корінь числа.";
messages.MATH_SUBTRACTION_SYMBOL = "-";
messages.MATH_TRIG_ACOS = "acos";
messages.MATH_TRIG_ASIN = "asin";
messages.MATH_TRIG_ATAN = "atan";
messages.MATH_TRIG_COS = "cos";
messages.MATH_TRIG_HELPURL =
	"https://uk.wikipedia.org/wiki/Тригонометричні_функції";
messages.MATH_TRIG_SIN = "sin";
messages.MATH_TRIG_TAN = "tan";
messages.MATH_TRIG_TOOLTIP_ACOS = "Повертає арккосинус числа.";
messages.MATH_TRIG_TOOLTIP_ASIN = "Повертає арксинус числа.";
messages.MATH_TRIG_TOOLTIP_ATAN = "Повертає арктангенс числа.";
messages.MATH_TRIG_TOOLTIP_COS =
	"Повертає косинус кута в градусах (не в радіанах).";
messages.MATH_TRIG_TOOLTIP_SIN =
	"Повертає синус кута в градусах (не в радіанах).";
messages.MATH_TRIG_TOOLTIP_TAN =
	"Повертає тангенс кута в градусах (не в радіанах).";
messages.MIPY_PIN_WARN_DIGITAL_READ =
	"Не вдалося налаштувати пін %1 як цифровий вхід, оскільки він був раніше зарезервований як %2.";
messages.MIPY_PIN_WARN_DIGITAL_WRITE =
	"Не вдалося налаштувати пін %1 як цифровий вихід, оскільки він був раніше зарезервований як %2.";
messages.MIPY_PIN_WARN_PWM =
	"Не вдалося налаштувати пін %1 як вихід PWM, оскільки він був раніше зарезервований як %2.";
messages.NEW_COLOUR_VARIABLE = "Створити змінну кольору...";
messages.NEW_NUMBER_VARIABLE = "Створити числову змінну...";
messages.NEW_STRING_VARIABLE = "Створити рядкову змінну...";
messages.NEW_VARIABLE = "Створити змінну...";
messages.NEW_VARIABLE_TITLE = "Назва нової змінної";
messages.NEW_VARIABLE_TYPE_TITLE = "Тип нової змінної:";
messages.NEW_LIST = "Назва нового списку";
messages.NEW_CLASS = "Назва нового класу";
messages.CONFIRM_CLEAR =
	"Це очистить ваші записані набори даних. Ви впевнені, що хочете продовжити?";
messages.ORDINAL_NUMBER_SUFFIX = "";
messages.PROCEDURES_ALLOW_STATEMENTS = "дозволити оператори";
messages.PROCEDURES_BEFORE_PARAMS = "з:";
messages.PROCEDURES_CALLNORETURN_HELPURL =
	"https://uk.wikipedia.org/wiki/Підпрограма";
messages.PROCEDURES_CALLNORETURN_TOOLTIP = "Виконати функцію користувача '%1'.";
messages.PROCEDURES_CALLRETURN_HELPURL =
	"https://uk.wikipedia.org/wiki/Підпрограма";
messages.PROCEDURES_CALLRETURN_TOOLTIP =
	"Виконати функцію користувача '%1' і використовувати її результат.";
messages.PROCEDURES_CALL_BEFORE_PARAMS = "з:";
messages.PROCEDURES_CREATE_DO = "Створити '%1'";
messages.PROCEDURES_DEFNORETURN_COMMENT = "Опишіть цю функцію...";
messages.PROCEDURES_DEFNORETURN_DO = "";
messages.PROCEDURES_DEFNORETURN_HELPURL =
	"https://uk.wikipedia.org/wiki/Підпрограма";
messages.PROCEDURES_DEFNORETURN_PROCEDURE = "ім'я";
messages.PROCEDURES_DEFNORETURN_TITLE = "Підпрограма";
messages.PROCEDURES_DEFNORETURN_TOOLTIP = "Створює функцію без вихідних даних.";
messages.PROCEDURES_DEFRETURN_HELPURL =
	"https://uk.wikipedia.org/wiki/Підпрограма";
messages.PROCEDURES_DEFRETURN_RETURN = "повернути";
messages.PROCEDURES_DEFRETURN_TOOLTIP = "Створює функцію з вихідними даними.";
messages.PROCEDURES_DEF_DUPLICATE_WARNING =
	"Попередження: Ця функція має дублікати параметрів.";
messages.PROCEDURES_HIGHLIGHT_DEF = "Підсвітити визначення функції";
messages.PROCEDURES_IFRETURN_HELPURL = "http://c2.com/cgi/wiki?GuardClause";
messages.PROCEDURES_IFRETURN_TOOLTIP =
	"Якщо значення істинне, повернути друге значення.";
messages.PROCEDURES_IFRETURN_WARNING =
	"Попередження: Цей блок можна використовувати лише у визначенні функції.";
messages.PROCEDURES_MUTATORARG_TITLE = "назва входу:";
messages.PROCEDURES_MUTATORARG_TOOLTIP = "Додати вхід до функції.";
messages.PROCEDURES_MUTATORCONTAINER_TITLE = "входи";
messages.PROCEDURES_MUTATORCONTAINER_TOOLTIP =
	"Додайте, видаліть або змініть порядок входів для цієї функції.";
messages.REDO = "Повторити";
messages.REMOVE_COMMENT = "Видалити коментар";
messages.RENAME_VARIABLE = "Перейменувати змінну...";
messages.RENAME_VARIABLE_TITLE = "Перейменувати всі змінні '%1' на:";
messages.TEXT_APPEND_HELPURL =
	"https://github.com/google/blockly/wiki/Text#text-modification";
messages.TEXT_APPEND_TITLE = "до %1 додати текст %2";
messages.TEXT_APPEND_TOOLTIP = "Додати текст до змінної '%1'.";
messages.TEXT_CHANGECASE_HELPURL =
	"https://github.com/google/blockly/wiki/Text#adjusting-text-case";
messages.TEXT_CHANGECASE_OPERATOR_LOWERCASE = "у нижній регістр";
messages.TEXT_CHANGECASE_OPERATOR_TITLECASE = "у Назва Кожного Слова";
messages.TEXT_CHANGECASE_OPERATOR_UPPERCASE = "у ВЕРХНІЙ РЕГІСТР";
messages.TEXT_CHANGECASE_TOOLTIP = "Повернути копію тексту в іншому регістрі.";
messages.TEXT_CHARAT_FIRST = "отримати першу літеру";
messages.TEXT_CHARAT_FROM_END = "отримати літеру № з кінця";
messages.TEXT_CHARAT_FROM_START = "отримати літеру №";
messages.TEXT_CHARAT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#extracting-text";
messages.TEXT_CHARAT_LAST = "отримати останню літеру";
messages.TEXT_CHARAT_RANDOM = "отримати випадкову літеру";
messages.TEXT_CHARAT_TAIL = "";
messages.TEXT_CHARAT_TITLE = "літера %1 з %2";
messages.TEXT_CHARAT_TOOLTIP = "Повертає літеру у вказаній позиції.";
messages.TEXT_COUNT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#counting-substrings";
messages.TEXT_COUNT_MESSAGE0 = "порахувати %1 у %2";
messages.TEXT_COUNT_TOOLTIP =
	"Порахувати, скільки разів деякий текст з'являється в іншому тексті.";
messages.TEXT_CREATE_JOIN_ITEM_TOOLTIP = "Додати елемент до тексту.";
messages.TEXT_CREATE_JOIN_TITLE_JOIN = "з'єднати";
messages.TEXT_CREATE_JOIN_TOOLTIP =
	"Додайте, видаліть або змініть порядок розділів, щоб переналаштувати цей текстовий блок.";
messages.TEXT_GET_SUBSTRING_END_FROM_END = "до літери № з кінця";
messages.TEXT_GET_SUBSTRING_END_FROM_START = "до літери №";
messages.TEXT_GET_SUBSTRING_END_LAST = "до останньої літери";
messages.TEXT_GET_SUBSTRING_HELPURL =
	"https://github.com/google/blockly/wiki/Text#extracting-a-region-of-text";
messages.TEXT_GET_SUBSTRING_INPUT_IN_TEXT = "у тексті";
messages.TEXT_GET_SUBSTRING_START_FIRST = "отримати підрядок від першої літери";
messages.TEXT_GET_SUBSTRING_START_FROM_END =
	"отримати підрядок від літери № з кінця";
messages.TEXT_GET_SUBSTRING_START_FROM_START = "отримати підрядок від літери №";
messages.TEXT_GET_SUBSTRING_TAIL = "";
messages.TEXT_GET_SUBSTRING_TOOLTIP = "Повертає вказану частину тексту.";
messages.TEXT_INDEXOF_HELPURL =
	"https://github.com/google/blockly/wiki/Text#finding-text";
messages.TEXT_INDEXOF_OPERATOR_FIRST = "знайти перше входження тексту";
messages.TEXT_INDEXOF_OPERATOR_LAST = "знайти останнє входження тексту";
messages.TEXT_INDEXOF_TITLE = "у тексті %1 %2 %3";
messages.TEXT_INDEXOF_TOOLTIP =
	"Повертає індекс першого/останнього входження першого тексту в другому. Повертає %1, якщо текст не знайдено.";
messages.TEXT_ISEMPTY_HELPURL =
	"https://github.com/google/blockly/wiki/Text#checking-for-empty-text";
messages.TEXT_ISEMPTY_TITLE = "%1 порожній";
messages.TEXT_ISEMPTY_TOOLTIP =
	"Повертає 'істина', якщо наданий текст порожній.";
messages.TEXT_JOIN_HELPURL =
	"https://github.com/google/blockly/wiki/Text#text-creation";
messages.TEXT_JOIN_TITLE_CREATEWITH = "створити текст із %1 %2";
messages.TEXT_JOIN_TOOLTIP =
	"Створити фрагмент тексту, з'єднавши будь-яку кількість елементів.";
messages.TEXT_LENGTH_HELPURL =
	"https://github.com/google/blockly/wiki/Text#text-modification";
messages.TEXT_LENGTH_TITLE = "довжина %1";
messages.TEXT_LENGTH_TOOLTIP =
	"Повертає кількість літер (включаючи пробіли) у наданому тексті.";
messages.TEXT_INCLUDES_TITLE = "%1 містить %2 ?";
messages.TEXT_PRINT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#printing-text";
messages.TEXT_PRINT_TITLE = "друкувати %1";
messages.TEXT_PRINT_TOOLTIP =
	"Надрукувати вказаний текст, число або інше значення.";
messages.TEXT_PROMPT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#getting-input-from-the-user";
messages.TEXT_PROMPT_TOOLTIP_NUMBER = "Запитати у користувача число.";
messages.TEXT_PROMPT_TOOLTIP_TEXT = "Запитати у користувача текст.";
messages.TEXT_PROMPT_TYPE_NUMBER = "запитати число з повідомленням";
messages.TEXT_PROMPT_TYPE_TEXT = "запитати текст з повідомленням";
messages.TEXT_REPLACE_HELPURL =
	"https://github.com/google/blockly/wiki/Text#replacing-substrings";
messages.TEXT_REPLACE_MESSAGE0 = "замінити %1 на %2 у %3";
messages.TEXT_REPLACE_TOOLTIP =
	"Замінити всі входження деякого тексту в іншому тексті.";
messages.TEXT_REVERSE_HELPURL =
	"https://github.com/google/blockly/wiki/Text#reversing-text";
messages.TEXT_REVERSE_MESSAGE0 = "перевернути %1";
messages.TEXT_REVERSE_TOOLTIP =
	"Змінює порядок символів у тексті на зворотний.";
messages.TEXT_TEXT_HELPURL =
	"https://uk.wikipedia.org/wiki/Рядок_(програмування)";
messages.TEXT_TEXT_TOOLTIP = "Літера, слово або рядок тексту.";
messages.TEXT_TRIM_HELPURL =
	"https://github.com/google/blockly/wiki/Text#trimming-removing-spaces";
messages.TEXT_TRIM_OPERATOR_BOTH = "обрізати пробіли з обох сторін";
messages.TEXT_TRIM_OPERATOR_LEFT = "обрізати пробіли з лівого боку";
messages.TEXT_TRIM_OPERATOR_RIGHT = "обрізати пробіли з правого боку";
messages.TEXT_TRIM_TOOLTIP =
	"Повернути копію тексту з видаленими пробілами з одного або обох кінців.";
messages.TEXT_TO_NUMBER = "Перетворити %1 на число";
messages.TODAY = "Сьогодні";
messages.UNDO = "Скасувати";
messages.UNNAMED_KEY = "без назви";
messages.VARIABLES_DEFAULT_NAME = "елемент";
messages.VARIABLES_GET_CREATE_SET = "Створити 'встановити %1'";
messages.VARIABLES_GET_HELPURL =
	"https://github.com/google/blockly/wiki/Variables#get";
messages.VARIABLES_GET_TOOLTIP = "Повертає значення цієї змінної.";
messages.VARIABLES_SET = "встановити %1 на %2";
messages.VARIABLES_SET_CREATE_GET = "Створити 'отримати %1'";
messages.VARIABLES_SET_HELPURL =
	"https://github.com/google/blockly/wiki/Variables#set";
messages.VARIABLES_SET_TOOLTIP =
	"Встановлює цю змінну рівною вхідному значенню.";
messages.VARIABLE_ALREADY_EXISTS = "Змінна з назвою '%1' вже існує.";
messages.VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE =
	"Змінна з назвою '%1' вже існує для іншого типу: '%2'.";
messages.WORKSPACE_ARIA_LABEL = "Робоча область Blockly";
messages.WORKSPACE_COMMENT_DEFAULT_TEXT = "Скажіть щось...";
messages.CONTROLS_FOREACH_INPUT_DO = messages.CONTROLS_REPEAT_INPUT_DO;
messages.CONTROLS_FOR_INPUT_DO = messages.CONTROLS_REPEAT_INPUT_DO;
messages.CONTROLS_IF_ELSEIF_TITLE_ELSEIF = messages.CONTROLS_IF_MSG_ELSEIF;
messages.CONTROLS_IF_ELSE_TITLE_ELSE = messages.CONTROLS_IF_MSG_ELSE;
messages.CONTROLS_IF_IF_TITLE_IF = messages.CONTROLS_IF_MSG_IF;
messages.CONTROLS_WHILEUNTIL_INPUT_DO = messages.CONTROLS_REPEAT_INPUT_DO;
messages.LISTS_CREATE = "Створити список";
messages.LISTS_CREATE_WITH_ITEM_TITLE = messages.VARIABLES_DEFAULT_NAME;
messages.LISTS_GET_INDEX_HELPURL = messages.LISTS_INDEX_OF_HELPURL;
messages.LISTS_GET_INDEX_INPUT_IN_LIST = messages.LISTS_INLIST;
messages.LISTS_GET_SUBLIST_INPUT_IN_LIST = messages.LISTS_INLIST;
messages.LISTS_INDEX_OF_INPUT_IN_LIST = messages.LISTS_INLIST;
messages.LISTS_SET_INDEX_INPUT_IN_LIST = messages.LISTS_INLIST;
messages.MATH_CHANGE_TITLE_ITEM = messages.VARIABLES_DEFAULT_NAME;
messages.PROCEDURES_DEFRETURN_COMMENT = messages.PROCEDURES_DEFNORETURN_COMMENT;
messages.PROCEDURES_DEFRETURN_DO = messages.PROCEDURES_DEFNORETURN_DO;
messages.PROCEDURES_DEFRETURN_PROCEDURE =
	messages.PROCEDURES_DEFNORETURN_PROCEDURE;
messages.PROCEDURES_DEFRETURN_TITLE = messages.PROCEDURES_DEFNORETURN_TITLE;
messages.TEXT_APPEND_VARIABLE = messages.VARIABLES_DEFAULT_NAME;
messages.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM = messages.VARIABLES_DEFAULT_NAME;

messages.LEAPHY_HUE = "188";
messages.LOGIC_HUE = "210";
messages.LOOPS_HUE = "120";
messages.MATH_HUE = "230";
messages.TEXTS_HUE = "160";
messages.LISTS_HUE = "260";
messages.COLOUR_HUE = "20";
messages.VARIABLES_HUE = "330";
messages.VARIABLES_DYNAMIC_HUE = "310";
messages.PROCEDURES_HUE = "290";
messages.EMPTY_BACKPACK = "Порожньо";
messages.REMOVE_FROM_BACKPACK = "Видалити з рюкзака";
messages.COPY_TO_BACKPACK = "Копіювати до рюкзака";
messages.COPY_ALL_TO_BACKPACK = "Копіювати всі блоки до рюкзака";
messages.PASTE_ALL_FROM_BACKPACK = "Вставити всі блоки з рюкзака";
messages.USE_I2C_CHANNEL = "Використовувати канал I2C";
messages.USE_I2C_CHANNEL_TOOLTIP =
	"Використовувати вибраний канал I2C для датчиків у цьому блоці";
messages.I2C_LIST_DEVICES = "Список підключених пристроїв I2C";
messages.LEAPHY_SEGMENT_INIT =
	"Ініціалізувати сегментний дисплей CLK %1 DIO %2";
messages.LEAPHY_SEGMENT_SET = "Встановити сегментний дисплей на %1";
messages.LEAPHY_SEGMENT_CLEAR = "Очистити сегментний дисплей";
messages.LEAPHY_SEGMENT_SET_BRIGHTNESS =
	"Встановити яскравість сегментного дисплея на %1";
messages.LEAPHY_MATRIX_INIT =
	"Ініціалізувати матричний дисплей DIN %1 CLK %2 CS %3";
messages.LEAPHY_MATRIX_SET = "Встановити LED матриці на x %1 y %2 у стан %3";
messages.LEAPHY_MATRIX_SET_BRIGHTNESS =
	"Встановити яскравість матричного дисплея на %1";
messages.LEAPHY_MATRIX_CLEAR = "Очистити матричний дисплей";
messages.LEAPHY_MATRIX_FILL = "Заповнити матричний дисплей %1 %2";
messages.LEAPHY_SOUND_INIT = "Ініціалізувати динамік RX %1 TX %2";
messages.LEAPHY_SOUND_PLAY = "Відтворити аудіо %1";
messages.LEAPHY_SOUND_SET_VOLUME = "Встановити гучність на %1";
messages.LEAPHY_SOUND_STOP = "Зупинити аудіо";
messages.LEAPHY_MESH_SETUP = "Налаштувати mesh-мережу з назвою %1";
messages.LEAPHY_MESH_UPDATE = "Оновити mesh";
messages.LEAPHY_MESH_CREATE_SIGNAL = "Створити сигнал";
messages.LEAPHY_MESH_NEW_SIGNAL = "Назвіть ваш сигнал";
messages.LEAPHY_MESH_ON_SIGNAL = "Коли я отримую %1";
messages.LEAPHY_MESH_BROADCAST_SIGNAL = "Транслювати %1";
messages.LEAPHY_MESH_CALL_SIGNAL = "Надіслати %1 до %2";
messages.LEAPHY_MESH_SENDER = "відправник";
messages.LEAPHY_RTC_GET = "Отримати час %1";
messages.LEAPHY_RTC_SET = "Встановити час на %1";
messages.LEAPHY_RTC_FORMAT = "Форматувати час";
messages.LEAPHY_FORMAT = "Формат";
messages.LEAPHY_SECOND = "Секунда";
messages.LEAPHY_MINUTE = "Хвилина";
messages.LEAPHY_HOUR = "Година";
messages.LEAPHY_WEEKDAY = "День тижня";
messages.LEAPHY_DAY = "День місяця";
messages.LEAPHY_MONTH = "Місяць";
messages.LEAPHY_YEAR = "Рік";
messages.LEAPHY_WITH_FORMAT = "з форматом: %1";
messages.LEAPHY_NUMERIC = "Числовий";
messages.LEAPHY_2_DIGITS = "2 цифри";
messages.LEAPHY_TEXT = "Текст";
messages.LEAPHY_FULL = "Повний";
messages.LEAPHY_TEMPLATE_FULL_NUMERIC = "Повний числовий";
messages.LEAPHY_TEMPLATE_DATE_NUMERIC = "Дата числова";
messages.LEAPHY_TEMPLATE_FULL_TEXT = "Повний текст";
messages.LEAPHY_TEMPLATE_DATE_TEXT = "Дата текстова";
messages.LEAPHY_TEMPLATE_TIME = "Час";
messages.LEAPHY_TEMPLATE_CUSTOM = "Власний";
messages.LEAPHY_READ_ACCELEROMETER = "Зчитати акселерометр вісь %1";
messages.LEAPHY_ACCELEROMETER_AXIS_X = "X";
messages.LEAPHY_ACCELEROMETER_AXIS_Y = "Y";
messages.LEAPHY_ACCELEROMETER_AXIS_Z = "Z";
messages.LEAPHY_READ_GYROSCOPE = "Зчитати гіроскоп вісь %1";
messages.LEAPHY_GYROSCOPE_AXIS_X = "X";
messages.LEAPHY_GYROSCOPE_AXIS_Y = "Y";
messages.LEAPHY_GYROSCOPE_AXIS_Z = "Z";
messages.ML_CLASSIFY = "Класифікувати входи";
messages.ML_CERTAINTY = "%1 виявлено";
messages.ML_ENABLE = "Увімкнути машинне навчання";
messages.ML_DISABLE = "Вимкнути машинне навчання";
messages.ML_ADD_CLASS = "Додати клас";
messages.ML_MODEL = "Модель";
messages.ML_LAYER_DENSE_RELU = "Шар (Dense ReLU) з %1 юнітами";
messages.LEAPHY_SDCARD_WRITE = "Записати на SD-карту";
messages.LEAPHY_SDCARD_WRITE_TO_FILE = "у файл";
messages.LEAPHY_SDCARD_WRITE_VALUE = "значення";
messages.LEAPHY_SDCARD_REMOVE = "Видалити файл %1 з SD-карти";
messages.LEAPHY_SDCARD_MKDIR = "Створити директорію %1 на SD-карті";
messages.MATH_MAP_TITLE = "відобразити (map)";
messages.MATH_MAP_FROM = "з діапазону низьке";
messages.MATH_MAP_TO = "високе";
messages.MATH_MAP_TARGET_FROM = "у діапазон низьке";
messages.MATH_MAP_TARGET_TO = "високе";
messages.MATH_MAP_TOOLTIP =
	"Переносить число з одного діапазону в інший. Ця функція не обмежує значення в межах діапазону, оскільки значення поза діапазоном іноді є навмисними та корисними.";
messages.RENAME_CLASS = "Перейменувати клас";
messages.DELETE_CLASS = "Видалити клас";
messages.RENAME_LIST = "Перейменувати список";
messages.DELETE_LIST = "Видалити список";
messages.RENAME_SIGNAL = "Перейменувати сигнал";
messages.DELETE_SIGNAL = "Видалити сигнал";
messages.SEARCH = "🔎 Пошук...";
messages.SEARCH_CATEGORY = "Пошук";
messages.LEAPHY_BLE_SETUP = "Налаштувати Bluetooth з назвою %1";
messages.LEAPHY_BLE_UPDATE = "Оновити Bluetooth";
messages.LEAPHY_BLE_IS_PRESSED = "Клавіша %1 натиснута";
messages.LEAPHY_BLE_CONNECT = "Підключитися до робота";
messages.LEAPHY_BLE_CONNECTED = "Відкрити дистанційне керування";
messages.LEAPHY_KEY_SPACE = "пробіл";
messages.LEAPHY_KEY_ARROW_UP = "стрілка вгору";
messages.LEAPHY_KEY_ARROW_DOWN = "стрілка вниз";
messages.LEAPHY_KEY_ARROW_RIGHT = "стрілка праворуч";
messages.LEAPHY_KEY_ARROW_LEFT = "стрілка ліворуч";
messages.DEFAULT = "За замовчуванням";
messages.LEAPHY_SPARK_READ = "Зчитати датчик Leaphy Spark %1";
messages.LEAPHY_SPARK_RGB = "Leaphy Spark світлодіод: червоний %1 зелений %2 синій %3";
messages.LEAPHY_SPARK_LEFT_LINE_SENSOR = "лівий датчик лінії";
messages.LEAPHY_SPARK_RIGHT_LINE_SENSOR = "правий датчик лінії";
messages.LEAPHY_SPARK_POTENTIOMETER = "потенціометр";
messages.LEAPHY_SPARK_LEFT_AMBIENT_LIGHT_SENSOR = "лівий датчик зовнішнього освітлення";
messages.LEAPHY_SPARK_RIGHT_AMBIENT_LIGHT_SENSOR = "правий датчик зовнішнього освітлення";
messages.LEAPHY_SPARK_BUTTON = "кнопка";

export default messages;
