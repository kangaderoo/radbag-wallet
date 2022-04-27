import { Alert } from 'react-native';

const _crypto = require('crypto');
import { scrypt } from 'react-native-fast-crypto';
var elliptic = require('elliptic');


export function encrypt (text, masterkey){
    // random initialization vector
    const iv = _crypto.randomBytes(16);
  
    // random salt
    const salt = _crypto.randomBytes(64);
  
    // derive key: 32 byte key length - in assumption the masterkey is a cryptographic and NOT a password there is no need for
    // a large number of iterations. It may can replaced by HKDF
    const key = _crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');
  
    // AES 256 GCM Mode
    const cipher = _crypto.createCipheriv('aes-256-gcm', key, iv);
  
    // encrypt the given text
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  
    // extract the auth tag
    const tag = cipher.getAuthTag();
  
    // generate output
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  
export function decrypt (encdata, masterkey){
    // base64 decoding
    const bData = Buffer.from(encdata, 'base64');
  
    // convert data to buffers
    const salt = bData.slice(0, 64);
    const iv = bData.slice(64, 80);
    const tag = bData.slice(80, 96);
    const text = bData.slice(96);
  
    // derive key using; 32 byte key length
    const key = _crypto.pbkdf2Sync(masterkey, salt , 2145, 32, 'sha512');
  
    // AES 256 GCM Mode
    const decipher = _crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
  
    // encrypt the given text
    const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
  
    return decrypted;
    
  }


  class EC_POINT {
    CURVE = {
      P:  BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"),
      n:  BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"),
      G:  [BigInt("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"),
           BigInt("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")]
    };
  
    constructor() {
      this._privatekey = "";
      this._uncompressed = "";
      this._point = [0n, 0n];
    }
    
    ECmod(number, modulo = this.CURVE.P){
      const result = number % modulo;
      return result >= 0 ? result : modulo + result;
    }
    
    ECPointAdd(PublicKey){
      // alert("A0")
      if (Buffer.isBuffer(PublicKey)){
        try{
          // alert("A1")
          if (PublicKey.length === 33){
            // alert("A2")
            try{
              // alert("PubK: "+PublicKey.toString('hex'))
            // this._uncompressed = Buffer.from(_crypto.ECDH.convertKey(PublicKey, 'secp256k1', 'hex', 'hex', 'uncompressed'),'hex');
            var ec = new elliptic.ec('secp256k1');
            this._uncompressed = ec.keyFromPublic(PublicKey, 'hex').getPublic(false, 'hex');
            // alert("Uncompressed PubK: " + this._uncompressed)
            } catch(err){
              alert(err);
            }
          }else if (PublicKey.length === 65){
            // alert("A3")
            this._uncompressed = PublicKey;
          } else {
            throw 'Lenght not compatible with Point on the Curve';
          }

          // alert("A4")
          const MyPoint = [BigInt("0x"+ this._uncompressed.slice(1, 33).toString('hex')),
                           BigInt("0x"+ this._uncompressed.slice(33, 65).toString('hex'))]
          const [X1, Y1, X2, Y2] = [this._point[0], this._point[1], MyPoint[0], MyPoint[1]];
          if (X1 === 0n || Y1 === 0n) this._point = [X2, Y2];
          if (X2 === 0n || Y2 === 0n) this._point = [X1, Y1];
          if (X1 === X2 && Y1 === Y2) this._point = this.ECPointDouble();
          if (X1 === X2 && Y1 === -Y2) this._point = [0n, 0n]
          const lam = this.ECmod((Y2 - Y1) * this.ECPointInv(X2 - X1));
          const X3 = this.ECmod(lam * lam - X1 - X2);
          const Y3 = this.ECmod(lam * (X1 - X3) - Y1);
          this._point = [X3, Y3];
          this._uncompressed = Buffer.from("04"+ X3.toString(16).padStart(64, '0') + Y3.toString(16).padStart(64, '0'), 'hex')
        }catch(Err){
          throw 'Error converting Public key to Point on the Curve';
        }
      }else{
        throw 'Parameter is not a Buffer!';
      }
    }
  
    MultiplyScalarJacobian(scalar, BasePoint = this.CURVE.G){
      PointR = [0n, 0n, 1n];
      PointN = [BasePoint[0], BasePoint[1], 1n];
      for (i=0; i < scalar.length; i++){
        const byte = scalar[scalar.length-1-i];
        for (j=0; j < 8; j++){
          if (byte & 2**j){ // ADD
            const [X1, Y1, Z1, X2, Y2, Z2] = [PointR[0], PointR[1], PointR[2], PointN[0], PointN[1], PointN[2]];
            if (X1 === 0n || Y1 === 0n) { // bacause this condition does occur at the begin
              PointR = PointN;
            }else{
              const Z2Z2 = this.ECmod(Z2 * Z2);
              const Z1Z1 = this.ECmod(Z1 * Z1);
              const U1 = this.ECmod(X1 * Z2Z2);
              const U2 = this.ECmod(X2 * Z1Z1);
              const S1 = this.ECmod(Y1 * Z2Z2 * Z2);
              const S2 = this.ECmod(Y2 * Z1Z1 * Z1);
              const H = this.ECmod(U2 - U1);
              const HH = this.ECmod(H * H);
              const HHH = this.ECmod(HH * H);
              const R = this.ECmod(S2 - S1);
              const V = this.ECmod(U1 * HH);
              const X3 = this.ECmod((R * R) - HHH - (2n * V));
              const Y3 = this.ECmod(R * (V - X3) - (S1 * HHH));
              const Z3 = this.ECmod(H*Z1*Z2);
              PointR = [X3, Y3, Z3];
            }
          }
          // Double
          const [X1, Y1, Z1] = [PointN[0], PointN[1], PointN[2]];
          const XX = this.ECmod(X1 * X1);
          const YY = this.ECmod(Y1 * Y1);
          const YYYY = this.ECmod(YY * YY);
          const ZZ = this.ECmod(Z1 * Z1);
          const S = this.ECmod(4n * X1 * YY);
          const M = this.ECmod(3n * XX);
          const X3 = this.ECmod(M * M - (2n * S));
          const Y3 = this.ECmod(M * (S - X3) - (8n * YYYY));
          const Z3 = this.ECmod(2n * Y1 * Z1);
          PointN =  [X3, Y3, Z3];
        }
      }
      // affine the jacobian point X=[x'/Z^2] Y=[y'/Z^3]
      const INVZ = this.ECPointInv(PointR[2])
      this._point = [this.ECmod(PointR[0] * INVZ * INVZ), this.ECmod(PointR[1] * INVZ * INVZ * INVZ)];
      this._uncompressed = Buffer.from("04"+ this._point[0].toString(16).padStart(64, '0')+ this._point[1].toString(16).padStart(64, '0'), 'hex');
    }
  
    MultiplyScalar(scalar, BasePoint = this.CURVE.G){
      PointR = [0n, 0n];
      PointN = BasePoint;
      for (i=0; i < scalar.length; i++){
        const byte = scalar[scalar.length-1-i];
        for (j=0; j < 8; j++){
          if (byte & 2**j){ // ADD
            const [X1, Y1, X2, Y2] = [PointR[0], PointR[1], PointN[0], PointN[1]];
            if (X1 === 0n || Y1 === 0n) { // bacause this condition does occur at the begin
              PointR = PointN;
            }else{
              const lam = this.ECmod((Y2 - Y1) * this.ECPointInv(X2 - X1));
              const X3 = this.ECmod(lam * lam - X1 - X2);
              const Y3 = this.ECmod(lam * (X1 - X3) - Y1);
              PointR = [X3, Y3];
            }
          }
          // Double
          const [X1, Y1] = [PointN[0], PointN[1]];
          const XX = this.ECmod(X1 * X1);
          const tripXX = this.ECmod(3n * XX)
          const lam = this.ECmod(tripXX * this.ECPointInv(Y1+Y1));
          const X3 = this.ECmod(lam * lam - (2n * X1));
          const Y3 = this.ECmod(lam * (X1 - X3) - Y1);
          PointN =  [X3, Y3];
        }
      }
      this._point = PointR;
      this._uncompressed = Buffer.from("04"+ this._point[0].toString(16).padStart(64, '0')+ this._point[1].toString(16).padStart(64, '0'), 'hex');
    }
    
    ECPointInv(number, modulo = this.CURVE.P) {
      // basic DIV0 protection
      if (number === 0) return number;
      let a = this.ECmod(number, modulo);
      let b = modulo;
      let [x, y, u, v] = [0n, 1n, 1n, 0n];
      while (a !== 0n) {
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        [b, a] = [a, r];
        [x, y] = [u, v];
        [u, v] = [m, n];
      }
      return this.ECmod(x);
    }
  
    setPrivateKey(PrivateKey){
      if (Buffer.isBuffer(PrivateKey)){
        try{
          this._privatekey = PrivateKey;
          this.MultiplyScalar(PrivateKey)
        }catch(Err){
          throw 'Error converting Private key to Point on the Curve';
        }
      }else{
        throw 'Parameter is not a buffer!';
      }
    }
      
    getPublicKey(){
        return this._uncompressed
    }
      
    setPublicKey(PublicKey){
      if (Buffer.isBuffer(PublicKey)){
        try {
          if (PublicKey.length === 33){
            var ec = new elliptic.ec('secp256k1');
            this._uncompressed = ec.keyFromPublic(PublicKey, 'hex').getPublic(false, 'hex');
            // this._uncompressed = Buffer.from(_crypto.ECDH.convertKey(this._compressed, 'secp256k1', 'hex', 'hex', 'uncompressed'),'hex');
          }else if (PublicKey.length === 65){
            this._uncompressed = PublicKey;
          } else {
            throw 'Lenght not compatible with Point on the Curve';
          }
          this._point = [BigInt("0x"+ this._uncompressed.slice(1, 33).toString('hex')),
                         BigInt("0x"+ this._uncompressed.slice(33, 65).toString('hex'))]
        }catch(Err){
          throw 'Error converting Public key to Point on the Curve';
        }
      }else{
        throw 'Parameter is not a Buffer!';
      }
    }
    getPoint(){
      return this._point
    }
    getDHAddPointX(){
      return (Buffer.from(this._point[0].toString(16).padStart(64, '0'), 'hex'));
    }
  }
  /*
    decryptMessage -- decrypt a Radix message using the DH_ADD_EPH_AESGCM256_SCRYPT_000 method
    @ encdata --> string of hex sequence of the encoded message
    @ sharedsecret --> Buffer containing the diffie-hellman PublicKey
    @ output --> decoded message
  */
  function decryptMessage (encdata, sharedsecret){
  
      // unhex the encdata string
      const bData = Buffer.from(encdata, 'hex');
      
      //convert data to buffers
      // the first two byte are "01FF" 
      //   "01"_stands for encrypted 
      //   "FF" stands for the methode used (DH_ADD_EPH_AESGCM256_SCRYPT_000)
      const EphemeralPublicKey = bData.slice(2, 35);
      const nonce = bData.slice(35, 47);
      const AuthTag = bData.slice(47, 63);
      const text = bData.slice(63);
  
      const EC_POINT_calc = new EC_POINT();
      EC_POINT_calc.setPublicKey(sharedsecret);
      EC_POINT_calc.ECPointAdd(EphemeralPublicKey);
      const MasterKey = EC_POINT_calc.getDHAddPointX();
      
  // >>>>>>>>>>>>>>>>>>>>>>>>>> old code replaced by the class
  //    // Convert the Ephemeral compressed Point to Ephemeral uncompressed Point and ECpoint for addition
  //    const Ephemeral = _crypto.ECDH.convertKey(EphemeralPublicKey, 'secp256k1', 'hex', 'hex', 'uncompressed');
  //    const EphemeralPoint = ECPointFromPublicKey(Buffer.from(Ephemeral,'hex'));
  //
  //    // Convert the Diffie Hellman uncompressed shared Point to ECpoint for addition
  //    const SharedSecretPoint = ECPointFromPublicKey(sharedsecret);
  //    const MasterKeyPoint = ECPointAdd(SharedSecretPoint, EphemeralPoint)
  //    console.log(MasterKeyPoint)
  //
  //    // generate the 32 byte Masterkey for this encryption
  //    const MasterKey = Buffer.from(MasterKeyPoint[0].toString(16).padStart(64, '0'), 'hex');
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  
      // salt
      const salthash = _crypto.createHash('sha256').update(nonce).digest('hex');
      const salt = Buffer.from(salthash, 'hex');
  
      // key    
      const key = _crypto.scryptSync(MasterKey, salt, 32, {N: 8192, r: 8, p: 1});
      
      // initialize the deciper engine in AES 256 GCM Mode
      const decipher = _crypto.createDecipheriv('aes-256-gcm', key, nonce);
  
      // additional authenticated data
      decipher.setAAD(EphemeralPublicKey);
  
      // Set the Authentication Tag
      decipher.setAuthTag(AuthTag);
  
      // decrypt the encoded message
      try{
          const decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
          return decrypted;
      }
      catch (err){
        return "Error decoding the message";
      }
  }
  /*
    encryptMessage -- decrypt a Radix message using the DH_ADD_EPH_AESGCM256_SCRYPT_000 method
    @ plaintext --> string containing plain readable text
    @ sharedsecret --> Buffer containing the diffie-hellman PublicKey
    @ output --> Buffer containing the full encrypted message
  
    ToDo: check if these is a max length to the plaintext
          this check needs to be done at the editor.
  */
  export async function encryptMessage (plaintext, sharedsecret){
  //    for debug if you need to check the encryption agains known random Ephemeral and nonce
  //    const RandomEphemeral = _crypto.createECDH('secp256k1');
  //    RandomEphemeral.setPublicKey("02663a6aaf4d5ec607330b9b74a840bf5c13b0a7357202fa85be56b13260655616", 'hex');
  
  const RandomEphemeral = _crypto.createECDH('secp256k1');
  RandomEphemeral.generateKeys('hex', 'compressed');
  // the Ephermeral Key string to be used as 'additional authenticated data'
  const EphemeralPublicKey = Buffer.from(RandomEphemeral.getPublicKey('hex', 'compressed'), 'hex');

  // const EC_POINT_calc = new EC_POINT();
  // // alert("0.1")
  // EC_POINT_calc.setPublicKey(sharedsecret);
  // // alert("0.2")
  // EC_POINT_calc.ECPointAdd(EphemeralPublicKey);
  // // alert("0.3")
  // const MasterKey = EC_POINT_calc.getDHAddPointX();
  // alert("0.4")
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> old code replaced by the class
   // Convert the Ephemeral compressed Point to Ephemeral uncompressed Point and ECpoint for addition
   var ec = new elliptic.ec('secp256k1');
   const Ephemeral = ec.keyFromPublic(EphemeralPublicKey, 'hex').getPublic(false, 'hex');
  //  const Ephemeral = _crypto.ECDH.convertKey(EphemeralPublicKey, 'secp256k1', 'hex', 'hex', 'uncompressed');
   const EphemeralPoint = ECPointFromPublicKey(Buffer.from(Ephemeral,'hex'));

   // Convert the Diffie Hellman uncompressed shared Point to ECpoint for addition
   const SharedSecretPoint = ECPointFromPublicKey(sharedsecret);
   const MasterKeyPoint = ECPointAdd(SharedSecretPoint, EphemeralPoint)

   // generate the 32 byte Masterkey for this encryption
   const MasterKey = Buffer.from(MasterKeyPoint[0].toString(16).padStart(64, '0'), 'hex');
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//    for debug if you need to check the encryption agains known random Ephemeral an nonce
//    const nonce = Buffer.from("57d6ee46d4d84e94ec615b42", 'hex');
  const nonce = _crypto.randomBytes(12);
// alert("0.5")
  // salt
  const salthash = _crypto.createHash('sha256').update(nonce).digest('hex');
  // alert("0.6")
  const salt = Buffer.from(salthash, 'hex');
// alert("1")
  // key    
  // try{
  const key = await scrypt(MasterKey, salt, 8192, 8, 1, 32)
  // } catch (err) {
  //   alert("Scrypt err: "+err)
  // }
  // const key = _crypto.scryptSync(MasterKey, salt, 32, {N: 8192, r: 8, p: 1});
  // alert("2")
  // initialize the ciper engine in AES 256 GCM Mode
  // try{
  const cipher = _crypto.createCipheriv('aes-256-gcm', key, nonce);
// } catch (err) {
//   alert("cipher err: "+err)
// }
  // alert("3")
  // additional authenticated data
  cipher.setAAD(EphemeralPublicKey);
  // alert("4")
  // encrypt the given text
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  // alert("5")
  // extract the auth tag
  const AuthTag = cipher.getAuthTag();
  // alert("6")
  // add header 01: encrypted FF: using DH_ADD_EPH_AESGCM256_SCRYPT_000 method
  const header = Buffer.from("01FF", 'hex');
  // alert("7")
  // generate output
  return Buffer.concat([header, EphemeralPublicKey, nonce, AuthTag, encrypted]).toString('hex');
  }
  /*
    CreateSharedSecret
    Create the Diffie-Hellman shared key.
    Todo: This function is not needed in combination with hardware wallet
    since it's private key stays secret.
    @ myPrivateKey --> Buffer of hex value, arbratairy Lenght
    @ PublicKey --> Buffer containing the Public key of the 'other party' 
                    both compressed and uncompressed is accepted.
    @ return --> Buffer containing the Diffie-Hellman shared EC_POINT
  */
  export function CreateSharedSecret(myPrivateKey, PublicKey){
    if (Buffer.isBuffer(myPrivateKey) && Buffer.isBuffer(PublicKey)){
      const EC_DH_calc = new EC_POINT();
      EC_DH_calc.setPublicKey(PublicKey);
      const EC_DH_POINT = EC_DH_calc.getPoint();
  
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> New jacobian function used 
  // the jacobian calculation should be more efficient in calculation
  // since there is only one inverse calculation perfomred.
  //    EC_DH_calc.MultiplyScalar(myPrivateKey, EC_DH_POINT);
  
      EC_DH_calc.MultiplyScalarJacobian(myPrivateKey, EC_DH_POINT);
      return EC_DH_calc.getPublicKey();
    }else{
     throw("Input keys need to be of type Buffer") 
    }
  }
  
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // >>                                                                                 <<
  // >>                       Everything below this box                                 <<
  // >>                     Is for testing purposes only                                <<
  // >>                                                                                 <<
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  
  // >>>>>>>> These functions have been moved to the class
  // >>>>>>>> the class containes some extra checks on valid key lengths etc.
  // >>>>>>>> these fuctions are still used in various tests at the end of module
  
  // parameters for secp256k1 Curve
  const CURVE = {
    P:  BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"),
    n:  BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"),
    G: [BigInt("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"),
        BigInt("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")]
  };
  
  /*
    ECPointFromPublicKey converts a public key to bigint [x,y] array
    @ pubkey --> Buffer containing 64 hex bytes uncompressed public key
  */
  export function ECPointFromPublicKey(pubkey){
      const ECPointX = pubkey.slice(1, 33).toString('hex');
      const ECPointY = pubkey.slice(33, 65).toString('hex');
      const x = BigInt("0x"+ ECPointX);
      const y = BigInt("0x"+ ECPointY);
      return [x,y]
    }
  
  /*
    ECmod field modulo function
    @ number --> BigInt value
    @ modulo --> Optional modulo
  */
  function ECmod(number , modulo = CURVE.P){
    const result = number % modulo;
    return result >= 0 ? result : modulo + result;
  }
  
  /*
    ECPointInv field inversion function
    @ number --> BigInt value
    @ modulo --> Optional modulo
  */
  function ECPointInv(number, modulo = CURVE.P) {
    // basic DIV0 protection
    if (number === 0) return number;
    let a = ECmod(number, modulo);
    let b = modulo;
    let [x, y, u, v] = [0n, 1n, 1n, 0n];
    while (a !== 0n) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      [b, a] = [a, r];
      [x, y] = [u, v];
      [u, v] = [m, n];
    }
    return ECmod(x);
  }
  
  /*
    ECPointAdd add two point on the curve
    @ PointA --> bigint [x,y] array
    @ PointB --> bigint [x,y] array
  */
  function ECPointAdd(PointA, PointB){
      const [X1, Y1, X2, Y2] = [PointA[0], PointA[1], PointB[0], PointB[1]];
      if (X1 === 0n || Y1 === 0n) return PointB;
      if (X2 === 0n || Y2 === 0n) return PointA;
      if (X1 === X2 && Y1 === Y2) return ECPointDouble(PointA);
      if (X1 === X2 && Y1 === -Y2) return [0n, 0n];
      const lam = ECmod((Y2 - Y1) * ECPointInv(X2 - X1));
      const X3 = ECmod(lam * lam - X1 - X2);
      const Y3 = ECmod(lam * (X1 - X3) - Y1);
      return [X3, Y3];
  }
  
  /*
    ECPointDouble double point on the curve
    @ Point --> bigint [x,y] array
  */
  function ECPointDouble(Point){
      const [X1, Y1] = [Point[0], Point[1]];
      if (X1 === 0n || Y1 === 0n) return Point;
      const dbl = ECmod(X1 * X1);
      const dbltrip = ECmod(dbl+dbl+dbl)
      const lam = ECmod(dbltrip * ECPointInv(Y1+Y1));
      const X3 = ECmod(lam * lam - X1 - X1);
      const Y3 = ECmod(lam * (X1 - X3) - Y1);
      return [X3, Y3];
    }
  
  /*
    ECPointMullScalar Multiply by double and add
    @ scalar --> bigint generator multiplier
    @ BasePoint --> BasePoint to be multiplied default is field generator
    
    For EC-Diffie-Hellman the return value still contains [x,y] of the Point on the CURVE
    This is needed for the addtion.
    the crypto.ECDH.computeSecret(xx.getPublicKey()); only returns a x coordinate 
    not a valid Point on the Curve
    
    This function calls both the add and double a lot of times,
    both functions us the ECpoint inversion function, that is very time consuming.
    ToDo: all looped Elliptic curve calculation need to be done using jacobian coordiantes
    This eliminates using the ECpoint inversion for each step.
    
  */
  export function ECPointMullScalar(scalar, BasePoint = CURVE.G){
    PointR = [0n, 0n]
    PointN = BasePoint
    for (i=0; i < scalar.length; i++){
      const byte = scalar[scalar.length-1-i];
      for (j=0; j < 8; j++){
        if (byte & 2**j){
          PointR = ECPointAdd(PointR, PointN)
        }
      PointN =  ECPointDouble(PointN)
      }
    }
    return PointR;
  }
  
  // <<<<<<<< These functions have been moved to the class
  
  