/**
* makecode I2C LCD1602 package for microbit.
* From microbit/micropython Chinese community.
* http://www.micropython.org.cn
*/

/**
 * Custom blocks
 */
//% weight=20 color=#0fbc11 icon="▀"
namespace I2C_LCD1602 {
    
    //  ************************************* START
    let LCD_CLEARDISPLAY        = 0x01
    let LCD_RETURNHOME          = 0x02
    let LCD_ENTRYMODESET        = 0x04
    let LCD_DISPLAYCONTROL      = 0x08
    let LCD_CURSORSHIFT         = 0x10
    let LCD_FUNCTIONSET         = 0x20
    let LCD_SETCGRAMADDR        = 0x40
    let LCD_SETDDRAMADDR        = 0x80
    // Entry flags
    let LCD_ENTRYRIGHT          = 0x00
    let LCD_ENTRYLEFT           = 0x02
    let LCD_ENTRYSHIFTINCREMENT = 0x01
    let LCD_ENTRYSHIFTDECREMENT = 0x00
    // Control flags
    let LCD_DISPLAYON           = 0x04
    let LCD_DISPLAYOFF          = 0x00
    let LCD_CURSORON            = 0x02
    let LCD_CURSOROFF           = 0x00
    let LCD_BLINKON             = 0x01
    let LCD_BLINKOFF            = 0x00
    // Move flags
    let LCD_DISPLAYMOVE         = 0x08
    let LCD_CURSORMOVE          = 0x00
    let LCD_MOVERIGHT           = 0x04
    let LCD_MOVELEFT            = 0x00
    // Function set flags
    let LCD_8BITMODE            = 0x10
    let LCD_4BITMODE            = 0x00
    let LCD_2LINE               = 0x08
    let LCD_1LINE               = 0x00
    let LCD_5x10DOTS            = 0x04
    let LCD_5x8DOTS             = 0x00

    let rs : DigitalPin
    let en : DigitalPin
    let d7 : DigitalPin
    let d6 : DigitalPin
    let d5 : DigitalPin
    let d4 : DigitalPin
    let backlight : DigitalPin
// ***************************************************END
    
    let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574
    let BK: number      // backlight control
    let RS: number      // command/data

    // set LCD reg
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    // send data to I2C bus
    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    // send command
    function cmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    // send data
    function dat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    // auto get LCD address
    function AutoAddr() {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr

        addr = 0x38
        while (k && (addr < 0x40)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr
        else return 0

    }

    /**
     * initial LCD, set I2C address. Address is 39/63 for PCF8574/PCF8574A
     * @param Addr is i2c address for LCD, eg: 0, 39, 63. 0 is auto find address
     */
    //% blockId="I2C_LCD1620_SET_ADDRESS" block="LCD initialize with Address %addr"
    //% weight=100 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function LcdInit(Addr: number) {
        if (Addr == 0) i2cAddr = AutoAddr()
        else i2cAddr = Addr
        BK = 8
        RS = 0
        cmd(0x33)       // set 4bit mode
        basic.pause(5)
        set(0x30)
        basic.pause(5)
        set(0x20)
        basic.pause(5)
        cmd(0x28)       // set mode
        cmd(0x0C)
        cmd(0x06)
        cmd(0x01)       // clear
	    
	//HAK1
	    basic.pause(10)
	    CreateCustomChar()
    }

    
    
     /**
     * Custom Char
     */
    //% blockId="I2C_LCD1620_CUSTOM_CHR" block="Custom Char"
    //% weight=60 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function CustomChar(): void {
        //    let dataArr: number[] = [Start_Byte, CMD_Bytes_Count, CMD, highByte, lowByte, End_Byte]

        //let bChar: number[] = [0x00,0x1b,0x15,0x11,0x0a,0x04,0x00,0x00]
          let bChar: number[] = [0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07]  
  	cmd(LCD_CURSORON)
	    basic.pause(5)
	    cmd(0x86)
		basic.pause(5)
	let location: number
        // we only have 8 locations 0-7
	location = 0
	//location &= 0x7
	//cmd(LCD_SETCGRAMADDR | (location << 3))
	    
	//cmd(LCD_SETCGRAMADDR)
        for (let i = 0; i < 8; i++) {
            dat(bChar[i])
        }  
    }
    

    //Create Custom Char At initialization
 function CreateCustomChar() {
        let bChar: number[] = [0x04,  0x00,  0x1E,  0x03,  0x0E,  0x10,  0x10,  0x0F]
	let location: number
        // we only have 8 locations 0-7
	location = 0
	//location &= 0x7
	//cmd(LCD_SETCGRAMADDR | (location << 3))
	    
	cmd(LCD_SETCGRAMADDR)
        for (let i = 0; i < 8; i++) {
            dat(bChar[i])
        }  
    }
    
    
    
    /**
     * show a number in LCD at given position
     * @param n is number will be show, eg: 10, 100, 200
     * @param x is LCD column position, eg: 0
     * @param y is LCD row position, eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_NUMBER" block="show number %n|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    /**
     * show a string in LCD at given position
     * @param s is string will be show, eg: "Hello"
     * @param x is LCD column position, [0 - 15], eg: 0
     * @param y is LCD row position, [0 - 1], eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_STRING" block="show string %s|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowString(s: string, x: number, y: number): void {
        let a: number

        if (y > 0)
            a = 0xC0
        else
            a = 0x80
        a += x
        cmd(a)

        for (let i = 0; i < s.length; i++) {
            dat(s.charCodeAt(i))
        }
    }

    /**
     * turn on LCD
     */
    //% blockId="I2C_LCD1620_ON" block="turn on LCD"
    //% weight=81 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function on(): void {
        cmd(0x0C)
    }

    /**
     * turn off LCD
     */
    //% blockId="I2C_LCD1620_OFF" block="turn off LCD"
    //% weight=80 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function off(): void {
        cmd(0x08)
    }

    /**
     * clear all display content
     */
    //% blockId="I2C_LCD1620_CLEAR" block="clear LCD"
    //% weight=85 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function clear(): void {
        cmd(0x01)
    }

    /**
     * turn on LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_ON" block="turn on backlight"
    //% weight=71 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOn(): void {
        BK = 8
        cmd(0)
    }

    /**
     * turn off LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_OFF" block="turn off backlight"
    //% weight=70 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOff(): void {
        BK = 0
        cmd(0)
    }

    /**
     * shift left
     */
    //% blockId="I2C_LCD1620_SHL" block="Shift Left"
    //% weight=61 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function shl(): void {
        cmd(0x18)
    }

    /**
     * shift right
     */
    //% blockId="I2C_LCD1620_SHR" block="Shift Right"
    //% weight=60 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function shr(): void {
        cmd(0x1C)
    }
}
