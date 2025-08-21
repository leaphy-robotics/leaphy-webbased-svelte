const messages: Record<string, string> = {};

messages.SENSOREN_CATEGORY = "Sensors";
messages.ACTUATOREN_CATEGORY = "Actuators";
messages.ADD_COMMENT = "Add Comment";
messages.ARD_ANALOGWRITE = "Set PWM pin";
messages.ARD_DIGITALWRITE = "Set digital pin";
messages.ARD_SET_MULTIPLEXER = "Set digital multiplexer to pin";
messages.ARD_PIN_WARN1 =
	"Pin %1 is needed for %2 as pin %3. Already in use as %4.";
messages.ARD_SERVO_READ = "Read servo pin";
messages.ARD_SERVO_REGULAR_WRITE = "Set servo pin";
messages.ARD_SERVO_ARM_WRITE = "Set Arm servo pin";
messages.ARD_SERVO_WRITE = "Set Servo Pin";
messages.ARD_SERVO_WRITE_DEG_180 = "degrees";
messages.ARD_SERVO_WRITE_TO = "angle to";
messages.ARD_TIME_DELAY = "during";
messages.ARD_TIME_DELAY_TIP = "Wait specific time in milliseconds";
messages.ARD_TIME_MS = "ms";
messages.ARD_WRITE_TO = "To";
messages.CANNOT_DELETE_VARIABLE_PROCEDURE =
	"Can't delete the variable '%1' because it's part of the definition of the function '%2'";
messages.CHANGE_VALUE_TITLE = "Change value:";
messages.CLEAN_UP = "Clean up Blocks";
messages.COLLAPSED_WARNINGS_WARNING = "Collapsed blocks contain warnings.";
messages.COLLAPSE_ALL = "Collapse Blocks";
messages.COLLAPSE_BLOCK = "Collapse Block";
messages.COLOUR_BLEND_COLOUR1 = "colour 1";
messages.COLOUR_BLEND_COLOUR2 = "colour 2";
messages.COLOUR_BLEND_HELPURL =
	"https://meyerweb.com/eric/tools/color-blend/#:::rgbp";
messages.COLOUR_BLEND_RATIO = "ratio";
messages.COLOUR_BLEND_TITLE = "blend";
messages.COLOUR_BLEND_TOOLTIP =
	"Blends two colours together with a given ratio (0.0 - 1.0).";
messages.COLOUR_PICKER_HELPURL = "https://en.wikipedia.org/wiki/Color";
messages.COLOUR_PICKER_TOOLTIP = "Choose a colour from the palette.";
messages.COLOUR_RANDOM_HELPURL = "http://randomcolour.com";
messages.COLOUR_RANDOM_TITLE = "random colour";
messages.COLOUR_RANDOM_TOOLTIP = "Choose a colour at random.";
messages.COLOUR_RGB_BLUE = "blue";
messages.COLOUR_RGB_GREEN = "green";
messages.COLOUR_RGB_HELPURL =
	"https://www.december.com/html/spec/colorpercompact.html";
messages.COLOUR_RGB_RED = "red";
messages.COLOUR_RGB_AMBIENT = "ambient";
messages.COLOUR_RGB_TITLE = "colour with";
messages.COLOUR_RGB_TOOLTIP =
	"Create a colour with the specified amount of red, green, and blue. All values must be between 0 and 100.";
messages.CONTROLS_FLOW_STATEMENTS_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#loop-termination-blocks";
messages.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK = "break out of loop";
messages.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE =
	"continue with next iteration of loop";
messages.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK =
	"Break out of the containing loop.";
messages.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE =
	"Skip the rest of this loop, and continue with the next iteration.";
messages.CONTROLS_FLOW_STATEMENTS_WARNING =
	"Warning: This block may only be used within a loop.";
messages.CONTROLS_FOREACH_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#for-each";
messages.CONTROLS_FOREACH_TITLE = "for each item %1 in list %2";
messages.CONTROLS_FOREACH_TOOLTIP =
	"For each item in a list, set the variable '%1' to the item, and then do some statements.";
messages.CONTROLS_FOR_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#count-with";
messages.CONTROLS_FOR_TITLE = "count with %1 from %2 to %3 by %4";
messages.CONTROLS_FOR_TOOLTIP =
	"Have the variable '%1' take on the values from the start number to the end number, counting by the specified interval, and do the specified blocks.";
messages.CONTROLS_IF_ELSEIF_TOOLTIP = "Add a condition to the if block.";
messages.CONTROLS_IF_ELSE_TOOLTIP =
	"Add a final, catch-all condition to the if block.";
messages.CONTROLS_IF_HELPURL = "https://github.com/google/blockly/wiki/IfElse";
messages.CONTROLS_IF_IF_TOOLTIP =
	"Add, remove, or reorder sections to reconfigure this if block.";
messages.CONTROLS_IF_MSG_ELSE = "else";
messages.CONTROLS_IF_MSG_ELSEIF = "else if";
messages.CONTROLS_MULTIPLEXER_1 = "Set multiplexer to";
messages.CONTROLS_MULTIPLEXER_2 = "then do";
messages.CONTROLS_IF_MSG_IF = "if";
messages.CONTROLS_IF_MSG_THEN = "then";
messages.CONTROLS_IF_TOOLTIP_1 = "If a value is true, then do some statements.";
messages.CONTROLS_IF_TOOLTIP_2 =
	"If a value is true, then do the first block of statements. Otherwise, do the second block of statements.";
messages.CONTROLS_IF_TOOLTIP_3 =
	"If the first value is true, then do the first block of statements. Otherwise, if the second value is true, do the second block of statements.";
messages.CONTROLS_IF_TOOLTIP_4 =
	"If the first value is true, then do the first block of statements. Otherwise, if the second value is true, do the second block of statements. If none of the values are true, do the last block of statements.";
messages.CONTROLS_REPEAT_FOREVER_TITLE = "repeat forever";
messages.CONTROLS_REPEAT_HELPURL = "https://en.wikipedia.org/wiki/For_loop";
messages.CONTROLS_REPEAT_INPUT_DO = "";
messages.CONTROLS_REPEAT_TITLE = "repeat %1 times";
messages.CONTROLS_REPEAT_TOOLTIP = "Do some statements several times.";
messages.CONTROLS_WHILEUNTIL_HELPURL =
	"https://github.com/google/blockly/wiki/Loops#repeat";
messages.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL = "repeat until";
messages.CONTROLS_WHILEUNTIL_OPERATOR_WHILE = "repeat while";
messages.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL =
	"While a value is false, then do some statements.";
messages.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE =
	"While a value is true, then do some statements.";
messages.DELETE_ALL_BLOCKS = "Delete all %1 blocks?";
messages.DELETE_BLOCK = "Delete Block";
messages.DELETE_VARIABLE = "Delete the '%1' variable";
messages.DELETE_VARIABLE_CONFIRMATION = "Delete %1 uses of the '%2' variable?";
messages.DELETE_X_BLOCKS = "Delete %1 Blocks";
messages.DIALOG_CANCEL = "Cancel";
messages.DIALOG_OK = "OK";
messages.DISABLE_BLOCK = "Disable Block";
messages.DUPLICATE_BLOCK = "Duplicate";
messages.DUPLICATE_COMMENT = "Duplicate Comment";
messages.ENABLE_BLOCK = "Enable Block";
messages.EXPAND_ALL = "Expand Blocks";
messages.EXPAND_BLOCK = "Expand Block";
messages.EXTERNAL_INPUTS = "External Inputs";
messages.HELP = "Help";
messages.INLINE_INPUTS = "Inline Inputs";
messages.LEAPHY_ANALOG_READ = "Read anapin";
messages.LEAPHY_BUZZ_BUZZ = "Buzz";
messages.LEAPHY_BUZZ_HERTZ = "Hertz";
messages.LEAPHY_BUZZ_MS = "ms";
messages.LEAPHY_CLICK_CATEGORY = "Leaphy Click";
messages.LEAPHY_DIGITAL_READ = "Read digipin";
messages.LEAPHY_CHOOSE_GAS = "Read gas";
messages.LEAPHY_DISPLAY_CLEAR = "Clear display";
messages.LEAPHY_DISPLAY_DISPLAY = "Show on display";
messages.LEAPHY_DISPLAY_PRINT = "Display - Set Ln.";
messages.LEAPHY_DISPLAY_SET_TEXT_SIZE = "Set text size";
messages.LEAPHY_DISPLAY_LARGE_CLEAR = "Clear large display";
messages.LEAPHY_DISPLAY_LARGE_DISPLAY = "Show on large display";
messages.LEAPHY_DISPLAY_LARGE_PRINT = "Large display - Set Ln.";
messages.LEAPHY_DISPLAY_LARGE_SET_TEXT_SIZE = "Set text size for large display";
messages.LEAPHY_EXTRA_CATEGORY = "Leaphy Extra";
messages.LEAPHY_FLITZ_CATEGORY = "Leaphy Flitz";
messages.LEAPHY_FLITZ_LED = "Nose light - ";
messages.LEAPHY_FLITZ_LED_B = "Blue";
messages.LEAPHY_FLITZ_LED_G = "Green";
messages.LEAPHY_FLITZ_LED_R = "Red";
messages.LEAPHY_FUNCTIONS_CATEGORY = "Custom Blocks";
messages.LEAPHY_GET_DISTANCE = "Get distance";
messages.LEAPHY_TOF_GET_DISTANCE = "Get ToF";
messages.LEAPHY_GET_AIR_PRESSURE = "Get air pressure";
messages.LEAPHY_TMP102_READ_TEMPERATURE = "Get TMP102 temperature";
messages.LEAPHY_GET_GESTURE = "Get gesture";
messages.LEAPHY_LED = "Led";
messages.LEAPHY_LED_BASIC_BLUE = "B";
messages.LEAPHY_LED_BASIC_GREEN = "G";
messages.LEAPHY_LED_BASIC_LED = "Ledstrip basis - Led";
messages.LEAPHY_LED_BASIC_RED = "R";
messages.LEAPHY_LED_BLUE = "Blue";
messages.LEAPHY_LED_GREEN = "Green";
messages.LEAPHY_LED_RED = "Red";
messages.LEAPHY_LED_SET_LEDS = "Leds";
messages.LEAPHY_LED_SET_PIN = "Pin";
messages.LEAPHY_LED_SET_SPEEDVALUE = "Ledstrip demo - Speed";
messages.LEAPHY_LED_SET_STRIP = "Set LED Strip";
messages.LEAPHY_LED_STRIP_BREATHE = "Breathe";
messages.LEAPHY_LED_STRIP_COLORGULF = "Color Gulf";
messages.LEAPHY_LED_STRIP_DEMO = "Ledstrip demo";
messages.LEAPHY_LED_STRIP_GULF = "Gulf";
messages.LEAPHY_LED_STRIP_LIGHTBANK = "Lightbank";
messages.LEAPHY_LED_STRIP_RAINBOW = "Rainbow";
messages.LEAPHY_MOTOR_A_DROPDOWN = "Motor_A";
messages.LEAPHY_MOTOR_BACKWARD = "Backward";
messages.LEAPHY_MOTOR_B_DROPDOWN = "Motor_B";
messages.LEAPHY_MOTOR_DIRECTION = "Direction";
messages.LEAPHY_MOTOR_FORWARD = "Forward";
messages.LEAPHY_MOTOR_LEFT = "Left";
messages.LEAPHY_MOTOR_LEFT_DROPDOWN = "Motor_L";
messages.LEAPHY_MOTOR_RIGHT = "Right";
messages.LEAPHY_MOTOR_RIGHT_DROPDOWN = "Motor_R";
messages.LEAPHY_MOTOR_SPEED = "Speed";
messages.LEAPHY_MOTOR_TYPE = "Type";
messages.LEAPHY_SERVO_SET = "Servo %1 with speed %2";
messages.LEAPHY_SERVO_MOVE = "Servo direction %1 with speed %2";
messages.LEAPHY_NUMBERS_CATEGORY = "Numbers";
messages.LEAPHY_OPERATORS_CATEGORY = "Operators";
messages.LEAPHY_ORIGINAL_CATEGORY = "Leaphy Original";
messages.LEAPHY_READ_HAND = "Read Hand sensor";
messages.LEAPHY_READ_STOMACH = "Read Belly sensor";
messages.LEAPHY_RGB_COLOR_BLUE = "Color B-255";
messages.LEAPHY_RGB_COLOR_GREEN = "Color G-255";
messages.LEAPHY_RGB_COLOR_RED = "Color R-255";
messages.LEAPHY_RGB_RAW_COLOR_BLUE = "RawColor Blue";
messages.LEAPHY_RGB_RAW_COLOR_GREEN = "RawColor Green";
messages.LEAPHY_RGB_RAW_COLOR_RED = "RawColor Red";
messages.LEAPHY_RGB_READ_SENSOR = "Read RGB sensor";
messages.LEAPHY_SERIAL_PRINT = "Show on screen";
messages.LEAPHY_SERIAL_AVAILABLE = "Available on screen";
messages.LEAPHY_SERIAL_READ_LINE = "Read from screen";
messages.LEAPHY_SITUATION_CATEGORY = "Thinkflow";
messages.LEAPHY_SONAR_READ_ECHO = "Echo";
messages.LEAPHY_SONAR_READ_TRIG = "Get distance Trig";
messages.LEAPHY_START = "Leaphy";
messages.LEAPHY_STOMACH_SENSOR_TYPE1 = "Type 1";
messages.LEAPHY_STOMACH_SENSOR_TYPE2 = "Type 2";
messages.LEAPHY_UNO_CATEGORY = "Arduino Uno";
messages.LEAPHY_VARIABLES_CATEGORY = "Variables";
messages.LEAPHY_LISTS_CATEGORY = "Lists";
messages.LEAPHY_LISTS_ADD = "add %1 to %2";
messages.LEAPHY_LISTS_DELETE = "delete %1 of %2";
messages.LEAPHY_LISTS_CLEAR = "delete all from %1";
messages.LEAPHY_LISTS_INSERT = "insert %1 at %2 of %3";
messages.LEAPHY_LISTS_REPLACE = "replace %1 of %2 with %3";
messages.LEAPHY_LISTS_GET = "get %1 of %2";
messages.LEAPHY_LISTS_LENGTH = "length of %1";
messages.LOGIC_BOOLEAN_FALSE = "false";
messages.LOGIC_BOOLEAN_HELPURL =
	"https://github.com/google/blockly/wiki/Logic#values";
messages.LOGIC_BOOLEAN_TOOLTIP = "Returns either true or false.";
messages.LOGIC_BOOLEAN_TRUE = "true";
messages.LOGIC_COMPARE_HELPURL =
	"https://en.wikipedia.org/wiki/Inequality_(mathematics)";
messages.LOGIC_COMPARE_TOOLTIP_EQ =
	"Return true if both inputs equal each other.";
messages.LOGIC_COMPARE_TOOLTIP_GT =
	"Return true if the first input is greater than the second input.";
messages.LOGIC_COMPARE_TOOLTIP_GTE =
	"Return true if the first input is greater than or equal to the second input.";
messages.LOGIC_COMPARE_TOOLTIP_LT =
	"Return true if the first input is smaller than the second input.";
messages.LOGIC_COMPARE_TOOLTIP_LTE =
	"Return true if the first input is smaller than or equal to the second input.";
messages.LOGIC_COMPARE_TOOLTIP_NEQ =
	"Return true if both inputs are not equal to each other.";
messages.LOGIC_NEGATE_HELPURL =
	"https://github.com/google/blockly/wiki/Logic#not";
messages.LOGIC_NEGATE_TITLE = "not %1";
messages.LOGIC_NEGATE_TOOLTIP =
	"Returns true if the input is false. Returns false if the input is true.";
messages.LOGIC_NULL = "null";
messages.LOGIC_NULL_HELPURL = "https://en.wikipedia.org/wiki/Nullable_type";
messages.LOGIC_NULL_TOOLTIP = "Returns null.";
messages.LOGIC_OPERATION_AND = "and";
messages.LOGIC_OPERATION_HELPURL =
	"https://github.com/google/blockly/wiki/Logic#logical-operations";
messages.LOGIC_OPERATION_OR = "or";
messages.LOGIC_OPERATION_TOOLTIP_AND = "Return true if both inputs are true.";
messages.LOGIC_OPERATION_TOOLTIP_OR =
	"Return true if at least one of the inputs is true.";
messages.LOGIC_TERNARY_CONDITION = "test";
messages.LOGIC_TERNARY_HELPURL = "https://en.wikipedia.org/wiki/%3F:";
messages.LOGIC_TERNARY_IF_FALSE = "if false";
messages.LOGIC_TERNARY_IF_TRUE = "if true";
messages.LOGIC_TERNARY_TOOLTIP =
	"Check the condition in 'test'. If the condition is true, returns the 'if true' value; otherwise returns the 'if false' value.";
messages.MATH_ADDITION_SYMBOL = "+";
messages.MATH_ARITHMETIC_HELPURL = "https://en.wikipedia.org/wiki/Arithmetic";
messages.MATH_ARITHMETIC_TOOLTIP_ADD = "Return the sum of the two numbers.";
messages.MATH_ARITHMETIC_TOOLTIP_DIVIDE =
	"Return the quotient of the two numbers.";
messages.MATH_ARITHMETIC_TOOLTIP_MINUS =
	"Return the difference of the two numbers.";
messages.MATH_ARITHMETIC_TOOLTIP_MULTIPLY =
	"Return the product of the two numbers.";
messages.MATH_ARITHMETIC_TOOLTIP_POWER =
	"Return the first number raised to the power of the second number.";
messages.MATH_ATAN2_HELPURL = "https://en.wikipedia.org/wiki/Atan2";
messages.MATH_ATAN2_TITLE = "atan2 of X:%1 Y:%2";
messages.MATH_ATAN2_TOOLTIP =
	"Return the arctangent of point (X, Y) in degrees from -180 to 180.";
messages.MATH_CHANGE_HELPURL =
	"https://en.wikipedia.org/wiki/Programming_idiom#Incrementing_a_counter";
messages.MATH_CHANGE_TITLE = "change %1 by %2";
messages.MATH_CHANGE_TOOLTIP = "Add a number to variable '%1'.";
messages.MATH_CONSTANT_HELPURL =
	"https://en.wikipedia.org/wiki/Mathematical_constant";
messages.MATH_CONSTANT_TOOLTIP =
	"Return one of the common constants: π (3.141…), e (2.718…), φ (1.618…), sqrt(2) (1.414…), sqrt(½) (0.707…), or ∞ (infinity).";
messages.MATH_CONSTRAIN_HELPURL =
	"https://en.wikipedia.org/wiki/Clamping_(graphics)";
messages.MATH_CONSTRAIN_TITLE = "constrain %1 low %2 high %3";
messages.MATH_CONSTRAIN_TOOLTIP =
	"Constrain a number to be between the specified limits (inclusive).";
messages.MATH_DIVISION_SYMBOL = "÷";
messages.MATH_IS_DIVISIBLE_BY = "is divisible by";
messages.MATH_IS_EVEN = "is even";
messages.MATH_IS_NEGATIVE = "is negative";
messages.MATH_IS_ODD = "is odd";
messages.MATH_IS_POSITIVE = "is positive";
messages.MATH_IS_PRIME = "is prime";
messages.MATH_IS_TOOLTIP =
	"Check if a number is an even, odd, prime, whole, positive, negative, or if it is divisible by certain number. Returns true or false.";
messages.MATH_IS_WHOLE = "is whole";
messages.MATH_MODULO_HELPURL = "https://en.wikipedia.org/wiki/Modulo_operation";
messages.MATH_MODULO_TITLE = "remainder of %1 ÷ %2";
messages.MATH_MODULO_TOOLTIP =
	"Return the remainder from dividing the two numbers.";
messages.MATH_MULTIPLICATION_SYMBOL = "×";
messages.MATH_NUMBER_HELPURL = "https://en.wikipedia.org/wiki/Number";
messages.MATH_NUMBER_TOOLTIP = "A number.";
messages.MATH_ONLIST_HELPURL = "";
messages.MATH_ONLIST_OPERATOR_AVERAGE = "average of list";
messages.MATH_ONLIST_OPERATOR_MAX = "max of list";
messages.MATH_ONLIST_OPERATOR_MEDIAN = "median of list";
messages.MATH_ONLIST_OPERATOR_MIN = "min of list";
messages.MATH_ONLIST_OPERATOR_MODE = "modes of list";
messages.MATH_ONLIST_OPERATOR_RANDOM = "random item of list";
messages.MATH_ONLIST_OPERATOR_STD_DEV = "standard deviation of list";
messages.MATH_ONLIST_OPERATOR_SUM = "sum of list";
messages.MATH_ONLIST_TOOLTIP_AVERAGE =
	"Return the average (arithmetic mean) of the numeric values in the list.";
messages.MATH_ONLIST_TOOLTIP_MAX = "Return the largest number in the list.";
messages.MATH_ONLIST_TOOLTIP_MEDIAN = "Return the median number in the list.";
messages.MATH_ONLIST_TOOLTIP_MIN = "Return the smallest number in the list.";
messages.MATH_ONLIST_TOOLTIP_MODE =
	"Return a list of the most common item(s) in the list.";
messages.MATH_ONLIST_TOOLTIP_RANDOM = "Return a random element from the list.";
messages.MATH_ONLIST_TOOLTIP_STD_DEV =
	"Return the standard deviation of the list.";
messages.MATH_ONLIST_TOOLTIP_SUM =
	"Return the sum of all the numbers in the list.";
messages.MATH_POWER_SYMBOL = "^";
messages.MATH_RANDOM_FLOAT_HELPURL =
	"https://en.wikipedia.org/wiki/Random_number_generation";
messages.MATH_RANDOM_FLOAT_TITLE_RANDOM = "random fraction";
messages.MATH_RANDOM_FLOAT_TOOLTIP =
	"Return a random fraction between 0.0 (inclusive) and 1.0 (exclusive).";
messages.MATH_RANDOM_INT_HELPURL =
	"https://en.wikipedia.org/wiki/Random_number_generation";
messages.MATH_RANDOM_INT_TITLE = "random integer from %1 to %2";
messages.MATH_RANDOM_INT_TOOLTIP =
	"Return a random integer between the two specified limits, inclusive.";
messages.MATH_ROUND_HELPURL = "https://en.wikipedia.org/wiki/Rounding";
messages.MATH_ROUND_OPERATOR_ROUND = "round";
messages.MATH_ROUND_OPERATOR_ROUNDDOWN = "round down";
messages.MATH_ROUND_OPERATOR_ROUNDUP = "round up";
messages.MATH_ROUND_TOOLTIP = "Round a number up or down.";
messages.MATH_SINGLE_HELPURL = "https://en.wikipedia.org/wiki/Square_root";
messages.MATH_SINGLE_OP_ABSOLUTE = "absolute";
messages.MATH_SINGLE_OP_ROOT = "square root";
messages.MATH_SINGLE_TOOLTIP_ABS = "Return the absolute value of a number.";
messages.MATH_SINGLE_TOOLTIP_EXP = "Return e to the power of a number.";
messages.MATH_SINGLE_TOOLTIP_LN = "Return the natural logarithm of a number.";
messages.MATH_SINGLE_TOOLTIP_LOG10 =
	"Return the base 10 logarithm of a number.";
messages.MATH_SINGLE_TOOLTIP_NEG = "Return the negation of a number.";
messages.MATH_SINGLE_TOOLTIP_POW10 = "Return 10 to the power of a number.";
messages.MATH_SINGLE_TOOLTIP_ROOT = "Return the square root of a number.";
messages.MATH_SUBTRACTION_SYMBOL = "-";
messages.MATH_TRIG_ACOS = "acos";
messages.MATH_TRIG_ASIN = "asin";
messages.MATH_TRIG_ATAN = "atan";
messages.MATH_TRIG_COS = "cos";
messages.MATH_TRIG_HELPURL =
	"https://en.wikipedia.org/wiki/Trigonometric_functions";
messages.MATH_TRIG_SIN = "sin";
messages.MATH_TRIG_TAN = "tan";
messages.MATH_TRIG_TOOLTIP_ACOS = "Return the arccosine of a number.";
messages.MATH_TRIG_TOOLTIP_ASIN = "Return the arcsine of a number.";
messages.MATH_TRIG_TOOLTIP_ATAN = "Return the arctangent of a number.";
messages.MATH_TRIG_TOOLTIP_COS = "Return the cosine of a degree (not radian).";
messages.MATH_TRIG_TOOLTIP_SIN = "Return the sine of a degree (not radian).";
messages.MATH_TRIG_TOOLTIP_TAN = "Return the tangent of a degree (not radian).";
messages.MIPY_PIN_WARN_DIGITAL_READ =
	"Could not configure pin %1 as digital input, since it was previously reserved as %2.";
messages.MIPY_PIN_WARN_DIGITAL_WRITE =
	"Could not configure pin %1 as digital output, since it was previously reserved as %2.";
messages.MIPY_PIN_WARN_PWM =
	"Could not configure pin %1 as a PWM output, since it was previously reserved as %2.";
messages.NEW_COLOUR_VARIABLE = "Create colour variable...";
messages.NEW_NUMBER_VARIABLE = "Create number variable...";
messages.NEW_STRING_VARIABLE = "Create string variable...";
messages.NEW_VARIABLE = "Create variable...";
messages.NEW_VARIABLE_TITLE = "New variable name:";
messages.NEW_VARIABLE_TYPE_TITLE = "New variable type:";
messages.ORDINAL_NUMBER_SUFFIX = "";
messages.PROCEDURES_ALLOW_STATEMENTS = "allow statements";
messages.PROCEDURES_BEFORE_PARAMS = "with:";
messages.PROCEDURES_CALLNORETURN_HELPURL =
	"https://en.wikipedia.org/wiki/Subroutine";
messages.PROCEDURES_CALLNORETURN_TOOLTIP =
	"Run the user-defined function '%1'.";
messages.PROCEDURES_CALLRETURN_HELPURL =
	"https://en.wikipedia.org/wiki/Subroutine";
messages.PROCEDURES_CALLRETURN_TOOLTIP =
	"Run the user-defined function '%1' and use its output.";
messages.PROCEDURES_CALL_BEFORE_PARAMS = "with:";
messages.PROCEDURES_CREATE_DO = "Create '%1'";
messages.PROCEDURES_DEFNORETURN_COMMENT = "Describe this function...";
messages.PROCEDURES_DEFNORETURN_DO = "";
messages.PROCEDURES_DEFNORETURN_HELPURL =
	"https://en.wikipedia.org/wiki/Subroutine";
messages.PROCEDURES_DEFNORETURN_PROCEDURE = "name";
messages.PROCEDURES_DEFNORETURN_TITLE = "Subprogram";
messages.PROCEDURES_DEFNORETURN_TOOLTIP = "Creates a function with no output.";
messages.PROCEDURES_DEFRETURN_HELPURL =
	"https://en.wikipedia.org/wiki/Subroutine";
messages.PROCEDURES_DEFRETURN_RETURN = "return";
messages.PROCEDURES_DEFRETURN_TOOLTIP = "Creates a function with an output.";
messages.PROCEDURES_DEF_DUPLICATE_WARNING =
	"Warning: This function has duplicate parameters.";
messages.PROCEDURES_HIGHLIGHT_DEF = "Highlight function definition";
messages.PROCEDURES_IFRETURN_HELPURL = "http://c2.com/cgi/wiki?GuardClause";
messages.PROCEDURES_IFRETURN_TOOLTIP =
	"If a value is true, then return a second value.";
messages.PROCEDURES_IFRETURN_WARNING =
	"Warning: This block may be used only within a function definition.";
messages.PROCEDURES_MUTATORARG_TITLE = "input name:";
messages.PROCEDURES_MUTATORARG_TOOLTIP = "Add an input to the function.";
messages.PROCEDURES_MUTATORCONTAINER_TITLE = "inputs";
messages.PROCEDURES_MUTATORCONTAINER_TOOLTIP =
	"Add, remove, or reorder inputs to this function.";
messages.REDO = "Redo";
messages.REMOVE_COMMENT = "Remove Comment";
messages.RENAME_VARIABLE = "Rename variable...";
messages.RENAME_VARIABLE_TITLE = "Rename all '%1' variables to:";
messages.TEXT_APPEND_HELPURL =
	"https://github.com/google/blockly/wiki/Text#text-modification";
messages.TEXT_APPEND_TITLE = "to %1 append text %2";
messages.TEXT_APPEND_TOOLTIP = "Append some text to variable '%1'.";
messages.TEXT_CHANGECASE_HELPURL =
	"https://github.com/google/blockly/wiki/Text#adjusting-text-case";
messages.TEXT_CHANGECASE_OPERATOR_LOWERCASE = "to lower case";
messages.TEXT_CHANGECASE_OPERATOR_TITLECASE = "to Title Case";
messages.TEXT_CHANGECASE_OPERATOR_UPPERCASE = "to UPPER CASE";
messages.TEXT_CHANGECASE_TOOLTIP =
	"Return a copy of the text in a different case.";
messages.TEXT_CHARAT_FIRST = "get first letter";
messages.TEXT_CHARAT_FROM_END = "get letter # from end";
messages.TEXT_CHARAT_FROM_START = "get letter #";
messages.TEXT_CHARAT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#extracting-text";
messages.TEXT_CHARAT_LAST = "get last letter";
messages.TEXT_CHARAT_RANDOM = "get random letter";
messages.TEXT_CHARAT_TAIL = "";
messages.TEXT_CHARAT_TITLE = "letter %1 of %2";
messages.TEXT_CHARAT_TOOLTIP = "Returns the letter at the specified position.";
messages.TEXT_COUNT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#counting-substrings";
messages.TEXT_COUNT_MESSAGE0 = "count %1 in %2";
messages.TEXT_COUNT_TOOLTIP =
	"Count how many times some text occurs within some other text.";
messages.TEXT_CREATE_JOIN_ITEM_TOOLTIP = "Add an item to the text.";
messages.TEXT_CREATE_JOIN_TITLE_JOIN = "join";
messages.TEXT_CREATE_JOIN_TOOLTIP =
	"Add, remove, or reorder sections to reconfigure this text block.";
messages.TEXT_GET_SUBSTRING_END_FROM_END = "to letter # from end";
messages.TEXT_GET_SUBSTRING_END_FROM_START = "to letter #";
messages.TEXT_GET_SUBSTRING_END_LAST = "to last letter";
messages.TEXT_GET_SUBSTRING_HELPURL =
	"https://github.com/google/blockly/wiki/Text#extracting-a-region-of-text";
messages.TEXT_GET_SUBSTRING_INPUT_IN_TEXT = "in text";
messages.TEXT_GET_SUBSTRING_START_FIRST = "get substring from first letter";
messages.TEXT_GET_SUBSTRING_START_FROM_END =
	"get substring from letter # from end";
messages.TEXT_GET_SUBSTRING_START_FROM_START = "get substring from letter #";
messages.TEXT_GET_SUBSTRING_TAIL = "";
messages.TEXT_GET_SUBSTRING_TOOLTIP =
	"Returns a specified portion of the text.";
messages.TEXT_INDEXOF_HELPURL =
	"https://github.com/google/blockly/wiki/Text#finding-text";
messages.TEXT_INDEXOF_OPERATOR_FIRST = "find first occurrence of text";
messages.TEXT_INDEXOF_OPERATOR_LAST = "find last occurrence of text";
messages.TEXT_INDEXOF_TITLE = "in text %1 %2 %3";
messages.TEXT_INDEXOF_TOOLTIP =
	"Returns the index of the first/last occurrence of the first text in the second text. Returns %1 if text is not found.";
messages.TEXT_ISEMPTY_HELPURL =
	"https://github.com/google/blockly/wiki/Text#checking-for-empty-text";
messages.TEXT_ISEMPTY_TITLE = "%1 is empty";
messages.TEXT_ISEMPTY_TOOLTIP = "Returns true if the provided text is empty.";
messages.TEXT_JOIN_HELPURL =
	"https://github.com/google/blockly/wiki/Text#text-creation";
messages.TEXT_JOIN_TITLE_CREATEWITH = "join %1 %2";
messages.TEXT_JOIN_TOOLTIP =
	"Create a piece of text by joining together any number of items.";
messages.TEXT_LENGTH_HELPURL =
	"https://github.com/google/blockly/wiki/Text#text-modification";
messages.TEXT_LENGTH_TITLE = "length of %1";
messages.TEXT_LENGTH_TOOLTIP =
	"Returns the number of letters (including spaces) in the provided text.";
messages.TEXT_INCLUDES_TITLE = "%1 contains %2 ?";
messages.TEXT_PRINT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#printing-text";
messages.TEXT_PRINT_TITLE = "print %1";
messages.TEXT_PRINT_TOOLTIP =
	"Print the specified text, number or other value.";
messages.TEXT_PROMPT_HELPURL =
	"https://github.com/google/blockly/wiki/Text#getting-input-from-the-user";
messages.TEXT_PROMPT_TOOLTIP_NUMBER = "Prompt for user for a number.";
messages.TEXT_PROMPT_TOOLTIP_TEXT = "Prompt for user for some text.";
messages.TEXT_PROMPT_TYPE_NUMBER = "prompt for number with message";
messages.TEXT_PROMPT_TYPE_TEXT = "prompt for text with message";
messages.TEXT_REPLACE_HELPURL =
	"https://github.com/google/blockly/wiki/Text#replacing-substrings";
messages.TEXT_REPLACE_MESSAGE0 = "replace %1 with %2 in %3";
messages.TEXT_REPLACE_TOOLTIP =
	"Replace all occurances of some text within some other text.";
messages.TEXT_REVERSE_HELPURL =
	"https://github.com/google/blockly/wiki/Text#reversing-text";
messages.TEXT_REVERSE_MESSAGE0 = "reverse %1";
messages.TEXT_REVERSE_TOOLTIP =
	"Reverses the order of the characters in the text.";
messages.TEXT_TEXT_HELPURL =
	"https://en.wikipedia.org/wiki/String_(computer_science)";
messages.TEXT_TEXT_TOOLTIP = "A letter, word, or line of text.";
messages.TEXT_TRIM_HELPURL =
	"https://github.com/google/blockly/wiki/Text#trimming-removing-spaces";
messages.TEXT_TRIM_OPERATOR_BOTH = "trim spaces from both sides of";
messages.TEXT_TRIM_OPERATOR_LEFT = "trim spaces from left side of";
messages.TEXT_TRIM_OPERATOR_RIGHT = "trim spaces from right side of";
messages.TEXT_TRIM_TOOLTIP =
	"Return a copy of the text with spaces removed from one or both ends.";
messages.TEXT_TO_NUMBER = "Convert %1 to number";
messages.TODAY = "Today";
messages.UNDO = "Undo";
messages.UNNAMED_KEY = "unnamed";
messages.VARIABLES_DEFAULT_NAME = "item";
messages.VARIABLES_GET_CREATE_SET = "Create 'set %1'";
messages.VARIABLES_GET_HELPURL =
	"https://github.com/google/blockly/wiki/Variables#get";
messages.VARIABLES_GET_TOOLTIP = "Returns the value of this variable.";
messages.VARIABLES_SET = "set %1 to %2";
messages.VARIABLES_SET_CREATE_GET = "Create 'get %1'";
messages.VARIABLES_SET_HELPURL =
	"https://github.com/google/blockly/wiki/Variables#set";
messages.VARIABLES_SET_TOOLTIP = "Sets this variable to be equal to the input.";
messages.VARIABLE_ALREADY_EXISTS = "A variable named '%1' already exists.";
messages.VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE =
	"A variable named '%1' already exists for another type: '%2'.";
messages.WORKSPACE_ARIA_LABEL = "Blockly Workspace";
messages.WORKSPACE_COMMENT_DEFAULT_TEXT = "Say something...";
messages.CONTROLS_FOREACH_INPUT_DO = messages.CONTROLS_REPEAT_INPUT_DO;
messages.CONTROLS_FOR_INPUT_DO = messages.CONTROLS_REPEAT_INPUT_DO;
messages.CONTROLS_IF_ELSEIF_TITLE_ELSEIF = messages.CONTROLS_IF_MSG_ELSEIF;
messages.CONTROLS_IF_ELSE_TITLE_ELSE = messages.CONTROLS_IF_MSG_ELSE;
messages.CONTROLS_IF_IF_TITLE_IF = messages.CONTROLS_IF_MSG_IF;
messages.CONTROLS_WHILEUNTIL_INPUT_DO = messages.CONTROLS_REPEAT_INPUT_DO;
messages.LISTS_CREATE = "Create List";
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
messages.EMPTY_BACKPACK = "Empty";
messages.REMOVE_FROM_BACKPACK = "Remove from backpack";
messages.COPY_TO_BACKPACK = "Copy to backpack";
messages.COPY_ALL_TO_BACKPACK = "Copy all blocks to backpack";
messages.PASTE_ALL_FROM_BACKPACK = "Paste all blocks from backpack";
messages.USE_I2C_CHANNEL = "Use I2C channel";
messages.USE_I2C_CHANNEL_TOOLTIP =
	"Use the selected I2C channel for sensors in this block";
messages.I2C_LIST_DEVICES = "List connected I2C devices";
messages.LEAPHY_SEGMENT_INIT = "Init segment display CLK %1 DIO %2";
messages.LEAPHY_SEGMENT_SET = "Set segment display to %1";
messages.LEAPHY_SEGMENT_CLEAR = "Clear segment display";
messages.LEAPHY_SEGMENT_SET_BRIGHTNESS = "Set segment display brightness to %1";
messages.LEAPHY_MATRIX_INIT = "Init matrix display DIN %1 CLK %2 CS %3";
messages.LEAPHY_MATRIX_SET = "Set matrix display led on x %1 y %2 to %3";
messages.LEAPHY_MATRIX_SET_BRIGHTNESS = "Set matrix display brightness to %1";
messages.LEAPHY_MATRIX_CLEAR = "Clear matrix display";
messages.LEAPHY_MATRIX_FILL = "Set matrix display %1 %2";
messages.LEAPHY_SOUND_INIT = "Init speaker RX %1 TX %2";
messages.LEAPHY_SOUND_PLAY = "Play audio %1";
messages.LEAPHY_SOUND_SET_VOLUME = "Set volume to %1";
messages.LEAPHY_SOUND_STOP = "Stop audio";
messages.LEAPHY_MESH_SETUP = "Setup mesh network with name %1";
messages.LEAPHY_MESH_UPDATE = "Update mesh";
messages.LEAPHY_MESH_ADD_PROCEDURE = "Add mesh block %1";
messages.LEAPHY_MESH_CALL_PROCEDURE = "Call mesh block %1 on %2";
messages.LEAPHY_MESH_CALL_PROCEDURE_ALL = "Call mesh block %1 on all %2";
messages.LEAPHY_MESH_ON_CONNECTION = "On mesh connection";
messages.LEAPHY_MESH_CLIENT = "Sender";
messages.LEAPHY_RTC_GET = "Time get %1";
messages.LEAPHY_RTC_SET = "Set time to %1";
messages.LEAPHY_RTC_FORMAT = "Format time";
messages.LEAPHY_FORMAT = "Format";
messages.LEAPHY_SECOND = "Second";
messages.LEAPHY_MINUTE = "Minute";
messages.LEAPHY_HOUR = "Hour";
messages.LEAPHY_WEEKDAY = "Weekday";
messages.LEAPHY_DAY = "Day of month";
messages.LEAPHY_MONTH = "Month";
messages.LEAPHY_YEAR = "Year";
messages.LEAPHY_WITH_FORMAT = "with format: %1";
messages.LEAPHY_NUMERIC = "Numeric";
messages.LEAPHY_2_DIGITS = "2 Digits";
messages.LEAPHY_TEXT = "Text";
messages.LEAPHY_FULL = "Full";
messages.LEAPHY_TEMPLATE_FULL_NUMERIC = "Full numeric";
messages.LEAPHY_TEMPLATE_DATE_NUMERIC = "Date numeric";
messages.LEAPHY_TEMPLATE_FULL_TEXT = "Full text";
messages.LEAPHY_TEMPLATE_DATE_TEXT = "Date text";
messages.LEAPHY_TEMPLATE_TIME = "Time";
messages.LEAPHY_TEMPLATE_CUSTOM = "Custom";
messages.LEAPHY_READ_ACCELEROMETER = "Read accelerometer axis %1";
messages.LEAPHY_ACCELEROMETER_AXIS_X = "X";
messages.LEAPHY_ACCELEROMETER_AXIS_Y = "Y";
messages.LEAPHY_ACCELEROMETER_AXIS_Z = "Z";
messages.LEAPHY_READ_GYROSCOPE = "Read gyroscope axis %1";
messages.LEAPHY_GYROSCOPE_AXIS_X = "X";
messages.LEAPHY_GYROSCOPE_AXIS_Y = "Y";
messages.LEAPHY_GYROSCOPE_AXIS_Z = "Z";
messages.LEAPHY_SDCARD_WRITE = "Write to SD card";
messages.LEAPHY_SDCARD_WRITE_TO_FILE = "to file";
messages.LEAPHY_SDCARD_WRITE_VALUE = "value";
messages.LEAPHY_SDCARD_REMOVE = "Delete file %1 from SD card";
messages.LEAPHY_SDCARD_MKDIR = "Make directory %1 on SD card";

export default messages;
