/*
auther: Kenji
Date: 2018-Feb-23
purpose: communication of U8256

*/
1:To use delimiter for serialport would delete the delimiter.For instance, delimiter is '\r\n' the RX value
  would not include '\r\n'.Like Analog  data of U8256 is 91 bytes, the feedback data is 89 byte(deduct the 
  delimiter '\r\n'

2: FCS calculation of string have to convert characters to hex. Like this: string.charCodeAt(i)
 
