import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import multer from "multer";
import { writeFile } from "fs/promises";
import fs from "fs"; // Import fs for createWriteStream and other fs operations
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit"; // Make sure to import PDFDocument if you're using it for PDF generation
import { log } from "console";

dotenv.config();

// Adjust __dirname for ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(
  //exp-proj-db in mongodb -> browser collection
  // process.env.MONGO_URL,
  // "mongodb+srv://exp:exp123@clusterexp.xw5sehz.mongodb.net/session-exp?retryWrites=true&w=majority",
 // "mongodb+srv://exp:explore@explorecluster.yweprwi.mongodb.net/expdb?retryWrites=true&w=majority",
   "mongodb+srv://exp:exp@cluster0.wpeuved.mongodb.net/session-exp?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  () => {
    console.log("\nDB connected");
  }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profileimage: {
      type: String,
      required: true,
      default: "/assets/booksanime-ezgif.com-crop.gif",
    },
    role: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, required: true, default: false }, // Indicates premium status
    expiryDate: { type: String, required: false }, // Indicates premium expiry
    role2: { type: String, required: true, default: "user" }, // New field for premium status
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "TBook" }], // Reference to TBook  model
    mgfavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Magazine" }], // Reference to TBook  model
    adfavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Audiobook" }], // Reference to TBook  model

  },
  { timestamps: true }
);

const User = new mongoose.model("User", userSchema);

//Routes
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user_exists = await User.findOne({ email: email });
    if (user_exists) {
      if (password === user_exists.password) {
        const token = jwt.sign({ id: user_exists._id }, "jwt_secret_key", {
          expiresIn: "60m",
        });

        return res.send({
          message: "Login Successfull",
          status: "ok",
          token: token,
          user: user_exists,
        });
      } else {
        return res.send({ message: "Password didn't match" });
      }
    } else {
      return res.send({ message: "User not registered" });
    }
  } catch (error) {
    return res.send({
      message: "Something went wrong, Try again later",
      error: error,
    });
  }
});

app.post("/register", async (req, res) => {
  const { name, username, gender, dob, email, password } = req.body;
  try {
    const user1 = await User.findOne({ email: email });
    const user2 = await User.findOne({ username: username });
    if (user1) {
      return res.send({ message: "User is already registerd." });
    } else if (user2) {
      return res.send({ message: "Username is already in use." });
    } else {
      const new_user = new User({
        name,
        role: "user",
        username,
        gender,
        dob,
        email,
        password,
      });
      new_user.save();

      return res.send({
        message: "Successfully Registered, Please login now.",
        status: "ok",
      });
    }
  } catch (error) {
    return res.send({ message: "Something went wrong, ty again later." });
  }
});

app.post("/forgortpassword", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ Status: "User not existed!" });
  }
  const token = jwt.sign({ id: user._id }, "jwt_secret_key", {
    expiresIn: "5m",
  });
  const url = `http://localhost:5173/reset_password/${user._id}/${token}`;
  const emailHtml = `<h2>Click to reset password : ${url}</h2>`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
      user: "explorethebooks3002@gmail.com",
      pass: "wnhg tmnr rrvm noty",
    },
  });

  const options = {
    from: "explorethebooks3002@gmail.com",
    to: email,
    subject: "Explore - Reset Password",
    html: emailHtml,
  };

  const emailSender = await transporter.sendMail(options);

  res.send({
    message: "Check your email",
    status: "ok",
    user: user,
    data: emailSender,
  });
});

app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, resetAction } = req.body;

  console.log(id, token, password, resetAction);

  const user_exists = await User.findOne({ _id: id });
  if (!user_exists) {
    return res.send({ message: "Invalid User doesn't exists" });
  }

  if (resetAction == "setNewPswd") {
    const oldPswd = token;
    if (oldPswd == user_exists.password) {
      user_exists.password = password;
      await user_exists.save();

      return res.send({ message: "Password Reset successful!", status: "ok" });
    } else {
      return res.send({ message: "Old Password is worng or invalid" });
    }
  }
  jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token" });
    }
    try {
      if (!user_exists) {
        return res.send({ message: "Invalid token or ID" });
      }

      user_exists.password = password;

      await user_exists.save();

      res.send({ message: "Password Reset done", status: "ok" });
    } catch (error) {
      return res.send({ error: error });
    }
  });
});

//audiobook
const bookSchema = new mongoose.Schema(
  {
    bkname: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    authname: {
      type: String,
      required: true,
    },
    bkimage: {
      type: String,
      required: true,
    },
    bkgenre: {
      type: String,
      required: true,
    },
    desp: {
      type: String,
      required: true,
    },
    bkcon: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Book = new mongoose.model("Book", bookSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post(
  "/addbook",
  upload.fields([
    { name: "bkImg", maxCount: 1 },
    { name: "bkCon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { bkname, role, authname, bkgenre, desp } = req.body;

      const bkImg = req.files["bkImg"] ? req.files["bkImg"][0] : null;
      const bkCon = req.files["bkCon"] ? req.files["bkCon"][0] : null;

      const bookInfo = await Book.findOne({ bkname: bkname });

      if (bookInfo) {
        return res.send({ message: "book already there!" });
      }

      let bkImgPath = "";
      let bkConPath = "";

      if (bkImg) {
        const bufferBkImg = bkImg.buffer;
        const bkImgPathPublic = `../client/public/users/bookCover/${
          bkname + "_" + bkImg.originalname
        }`;
        await writeFile(bkImgPathPublic, bufferBkImg);

        bkImgPath = `/users/bookCover/${bkname + "_" + bkImg.originalname}`;
      } else {
        bkImgPath = "/assets/logoExplore.png";
      }

      if (bkCon) {
        const bufferBkCon = bkCon.buffer;
        const bkConPathPublic = `../client/public/users/bookCon/${
          bkname + "_" + bkCon.originalname
        }`;
        await writeFile(bkConPathPublic, bufferBkCon);

        bkConPath = `/users/bookCon/${bkname + "_" + bkCon.originalname}`;
      } else {
        bkConPath = "noBookContent";
      }

      const book = new Book({
        bkname,
        role,
        authname,
        bkimage: bkImgPath,
        bkgenre,
        desp,
        bkcon: bkConPath,
      });

      book.save();
      return res.send({ message: "Book add Successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

app.post(
  "/edit-book",
  upload.fields([
    { name: "bkImagePath", maxCount: 1 },
    // { name: "bkCon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { bkName, authName, bkGenre, bkDesp } = req.body;

      const bkImagePath = req.files["bkImagePath"]
        ? req.files["bkImagePath"][0]
        : null;
      // const bkCon = req.files["bkCon"] ? req.files["bkCon"][0] : null;

      const bookInfo = await TBook.findOne({ bkName: bkName });

      if (!bookInfo) {
        return res.send({ message: "book doesn't exists!" });
      }

      if (authName) bookInfo.authName = authName;
      if (bkGenre) bookInfo.bkGenre = bkGenre;
      if (bkDesp) bookInfo.bkDesp = bkDesp;

      let bkImagePathPath = "";
      // let bkConPath = "";

      if (bkImagePath && bkImagePath.originalname) {
        const bufferbkImagePath = bkImagePath.buffer;
        const bkImagePathPathPublic = `../client/public/users/bookCover/${
          bkName + "_" + bkImagePath.originalname
        }`;
        await writeFile(bkImagePathPathPublic, bufferbkImagePath);

        bkImagePathPath = `/users/bookCover/${
          bkName + "_" + bkImagePath.originalname
        }`;
        bookInfo.bkImagePath = bkImagePathPath;
      }

      // if (bkCon) {
      //   const bufferBkCon = bkCon.buffer;
      //   const bkConPathPublic = `../client/public/users/bookCon/${
      //     bkName + "_" + bkCon.originalname
      //   }`;
      //   await writeFile(bkConPathPublic, bufferBkCon);

      //   bkConPath = `/users/bookCon/${bkName + "_" + bkCon.originalname}`;
      //   bookInfo.bkcon = bkConPath;
      // }

      await bookInfo.save();
      // const book = new Book({
      //   bkName,
      //   authName,
      //   bkimage: bkImagePathPath,
      //   bkGenre,
      //   bkDesp,
      //   bkcon: bkConPath,
      // });
      return res.send({ message: "Book edited Successfully!", status: "ok" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

const delBookSchema = new mongoose.Schema(
  {
    bkName: {
      type: String,
      required: true,
    },
    authName: {
      type: String,
      required: true,
    },
    bkImagePath: {
      type: String,
      required: true,
    },
    chapters: [
      {
        title: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
      },
    ],
    bkGenre: {
      type: String,
      required: true,
    },
    bkDesp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DelBook = new mongoose.model("DelBook", delBookSchema);

app.post("/delbook", async (req, res) => {
  try {
    const { bkName } = req.body;
    // console.log(bkName);
    const bookExist = await TBook.findOne({ bkName: bkName });

    if (!bookExist) {
      return res.send({ message: "book doesn't exists!" });
    }

    const delbook = new DelBook({
      bkName: bookExist.bkName,
      authName: bookExist.authName,
      bkImagePath: bookExist.bkImagePath,
      bkGenre: bookExist.bkGenre,
      bkDesp: bookExist.bkDesp,
      chapters: bookExist.chapters,
    });

    await delbook.save();

    await TBook.deleteOne({ bkName });

    return res.send({ message: "book deleted successfully !", status: "del" });
  } catch (error) {
    console.log(error);
  }
});

//get deleted books
app.post("/get-delbook", async (req, res) => {
  const { delbooks } = await req.body;
  console.log(delbooks);
  try {
    // if (books == "books") {
    const delbookInfo = await DelBook.find({}); //Book is from where is it from database (user)

    if (!delbookInfo) {
      return res.send({ message: "No delboook in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: delbookInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

//audiobook
const audiobookSchema = new mongoose.Schema(
  {
    audioBkName: {
      type: String,
      required: true,
    },
    audioAuthName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    audioBkImage: {
      type: String,
      required: true,
    },
    audioBkGenre: {
      type: String,
      required: true,
    },
    audioDesp: {
      type: String,
      required: true,
    },
    audioBkCon: {
      type: String,
      required: true,
    },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "User",
        },
        username: {
          type: String,
          required: false,
        },
        rating: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Audiobook = new mongoose.model("Audiobook", audiobookSchema);

app.post(
  "/addaudiobook",
  upload.fields([
    { name: "audioBkImage", maxCount: 1 },
    { name: "audioBkCon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { audioBkName, audioAuthName, audioBkGenre, audioDesp, role } =
        req.body;

      const audioBkImage = req.files["audioBkImage"]
        ? req.files["audioBkImage"][0]
        : null;
      const audioBkCon = req.files["audioBkCon"]
        ? req.files["audioBkCon"][0]
        : null;

      const audiobookInfo = await Audiobook.findOne({
        audioBkName: audioBkName,
      });

      if (audiobookInfo) {
        return res.send({ message: "book already there!" });
      }

      let audioBkImagePath = "";
      let audioBkConPath = "";
      // console.log(audioBkImage, audioBkCon);

      if (audioBkImage && audioBkImage.originalname) {
        const bufferaudioBkImage = audioBkImage.buffer;
        const audioBkImagePathPublic = `../client/public/users/audioBookCover/${
          audioBkName + "_" + audioBkImage.originalname
        }`; //why is ` used??
        await writeFile(audioBkImagePathPublic, bufferaudioBkImage);

        audioBkImagePath = `/users/audioBookCover/${
          audioBkName + "_" + audioBkImage.originalname
        }`;
      } else {
        audioBkImagePath = "/assets/logoExplore.png";
      }
      // why is audioBkCon.originalname used ??
      if (audioBkCon && audioBkCon.originalname) {
        const bufferaudioBkCon = audioBkCon.buffer;
        const audioBkConPathPublic = `../client/public/users/audioBookCon/${
          audioBkName + "_" + audioBkCon.originalname
        }`;
        await writeFile(audioBkConPathPublic, bufferaudioBkCon);

        audioBkConPath = `/users/audioBookCon/${
          audioBkName + "_" + audioBkCon.originalname
        }`;
      } else {
        audioBkConPath = "noBookContent";
      }

      const audiobook = new Audiobook({
        audioBkName,
        audioAuthName,
        role,
        audioBkImage: audioBkImagePath,
        audioBkGenre,
        audioDesp,
        audioBkCon: audioBkConPath,
      });

      audiobook.save();
      return res.send({ message: "Audio Book add Successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);
app.post("/get-audiobk", async (req, res) => {
  const { audiobooks } = await req.body;
  console.log(audiobooks);
  try {
    // if (books == "books") {
    const audiobookInfo = await Audiobook.find({}); //Book is from where is it from database (user)

    if (!audiobookInfo) {
      return res.send({ message: "No book in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: audiobookInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

//get delaudiobook
app.post("/get-delaudiobk", async (req, res) => {
  const { delaudiobooks } = await req.body;
  console.log(delaudiobooks);
  try {
    // if (books == "books") {
    const delaudiobookInfo = await DelAudiobook.find({}); //Book is from where is it from database (user)

    if (!delaudiobookInfo) {
      return res.send({ message: "No book in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: delaudiobookInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

//latest-audiobooks

app.post("/get-latest-audiobooks", async (req, res) => {
  try {
    const latestBooks = await Audiobook.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (most recent first)
      .limit(5); // Limit the result to 5 documents
    res.json({ data: latestBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//magzine
const magazineSchema = new mongoose.Schema(
  {
    magName: {
      type: String,
      required: true,
    },
    magAuthName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    magImage: {
      type: String,
      required: true,
    },
    magGenre: {
      type: String,
      required: true,
    },
    magDesp: {
      type: String,
      required: true,
    },
    magCon: {
      type: String,
      required: true,
    },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "User",
        },
        username: {
          type: String,
          required: false,
        },
        rating: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Magazine = new mongoose.model("Magazine", magazineSchema);

app.post(
  "/addmagzine",
  upload.fields([
    { name: "magImage", maxCount: 1 },
    { name: "magCon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { magName, magAuthName, magGenre, magDesp, role } = req.body;

      const magImage = req.files["magImage"] ? req.files["magImage"][0] : null;
      const magCon = req.files["magCon"] ? req.files["magCon"][0] : null;

      const magInfo = await Magazine.findOne({
        magName: magName,
      });

      if (magInfo) {
        return res.send({ message: "Magzine already there!" });
      }

      let magImagePath = "";
      let magConPath = "";
      // console.log(magImage, magCon);

      if (magImage && magImage.originalname) {
        const buffermagImage = magImage.buffer;
        const magImagePathPublic = `../client/public/users/magzineCover/${
          magName + "_" + magImage.originalname
        }`; //why is ` used??
        await writeFile(magImagePathPublic, buffermagImage);

        magImagePath = `/users/magzineCover/${
          magName + "_" + magImage.originalname
        }`;
      } else {
        magImagePath = "/assets/logoExplore.png";
      }
      // why is magCon.originalname used ??
      if (magCon && magCon.originalname) {
        const buffermagCon = magCon.buffer;
        const magConPathPublic = `../client/public/users/magazineCon/${
          magName + "_" + magCon.originalname
        }`;
        await writeFile(magConPathPublic, buffermagCon);

        magConPath = `/users/magazineCon/${
          magName + "_" + magCon.originalname
        }`;
      } else {
        magConPath = "noBookContent";
      }

      const magazine = new Magazine({
        magName,
        magAuthName,
        role,
        magImage: magImagePath,
        magGenre,
        magDesp,
        magCon: magConPath,
      });

      magazine.save();
      return res.send({ message: "Magazine add Successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);
app.post("/get-mag", async (req, res) => {
  const { magazines } = await req.body;
  console.log(magazines);
  try {
    // if (books == "books") {
    const magazineInfo = await Magazine.find({}); //Book is from where is it from database (user)

    if (!magazineInfo) {
      return res.send({ message: "No magazine in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: magazineInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

{/*app.get("/get-mag/:magName", async (req, res) => {
  const magName = req.params.magName;
  try {
    const magazine = await Magazine.findOne({ magName: magName });
    if (magazine) {
      res.json(magazine);
    } else {
      res.status(404).send({ message: "Magazine not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});*/}


//edit-audiobooks
app.post(
  "/edit-magazine",
  upload.fields([
    { name: "magImage", maxCount: 1 },
    { name: "magCon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { magName, magAuthName, magGenre, magDesp } = req.body;

      const magImage = req.files["magImage"] ? req.files["magImage"][0] : null;
      const magCon = req.files["magCon"] ? req.files["magCon"][0] : null;

      const magazineInfo = await Magazine.findOne({
        magName: magName,
      });

      if (!magazineInfo) {
        return res.send({ message: "magazine doesn't exists!" });
      }

      // console.log(
      //   magName,
      //   audioAuthName,
      //   audioBkGenre,
      //   audioDesp,
      // magImage
      // magazineInfo
      //   magCon
      // );

      if (magAuthName) magazineInfo.magAuthName = magAuthName;
      if (magGenre) magazineInfo.magGenre = magGenre;
      if (magDesp) magazineInfo.magDesp = magDesp;

      let magImagePath = "";
      let magConPath = "";

      // console.log(magImage.originalname);
      if (magImage && magImage.originalname) {
        const buffermagImage = magImage.buffer;

        const magImagePathPublic = `../client/public/users/magzineCover/${
          magName + "_" + magImage.originalname
        }`;
        await writeFile(magImagePathPublic, buffermagImage);

        magImagePath = `/users/magazineCover/${
          magName + "_" + magImage.originalname
        }`;
        // updating
        magazineInfo.magImage = magImagePath;
      }

      if (magCon && magCon.originalname) {
        const buffermagCon = magCon.buffer;
        const magConPathPublic = `../client/public/users/magazineCon/${
          magName + "_" + magCon.originalname
        }`;
        await writeFile(magConPathPublic, buffermagCon);

        magConPath = `/users/magazineCon/${
          magName + "_" + magCon.originalname
        }`;
        // updating
        magazineInfo.magCon = magConPath;
      }

      await magazineInfo.save();

      return res.send({
        message: "Magazine edited Successfully!",
        status: "ok",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

//delete Magazine
const delMagazineSchema = new mongoose.Schema(
  {
    magName: {
      type: String,
      required: true,
    },
    magAuthName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    magImage: {
      type: String,
      required: true,
    },
    magGenre: {
      type: String,
      required: true,
    },
    magDesp: {
      type: String,
      required: true,
    },
    magCon: {
      type: String,
      required: true,
    },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "User",
        },
        username: {
          type: String,
          required: false,
        },
        rating: { type: Number, required: true },
      },
    ],
  },
  
  
  { timestamps: true }
);

const DelMagazine = new mongoose.model("DelMagazine", delMagazineSchema);

app.post("/delmagazine", async (req, res) => {
  try {
    const { magName } = req.body;
    // console.log(magName);
    const magazineExist = await Magazine.findOne({ magName });
    if (!magazineExist) {
      return res.send({ message: "magazine doesn't exists!" });
    }
    // console.log(magazineExist);

    const delmagazine = new DelMagazine({
      magName: magazineExist.magName,
      magAuthName: magazineExist.magAuthName,
      magImage: magazineExist.magImage,
      magGenre: magazineExist.magGenre,
      magDesp: magazineExist.magDesp,
      magCon: magazineExist.magCon,
      role: magazineExist.role,
    });

    await delmagazine.save();
    await Magazine.deleteOne({ magName });

    return res.send({
      message: "magazine deleted successfully !",
      status: "del",
    });
  } catch (error) {
    console.log(error);
  }
});


// get user details
app.post("/get-dbuser", async (req, res) => {
  const { users } = await req.body;
  console.log(users);
  try {
    // if (books == "books") {
    const userInfo = await User.find({}); //Book is from where is it from database (user)

    if (!userInfo) {
      return res.send({ message: "No book in DB!" });
    }
    // console.log(userInfo);
    return res.send({ message: "Data found", data: userInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

app.post("/get-deluser", async (req, res) => {
  const { delusers } = await req.body;
  console.log(delusers);
  try {
    // if (books == "books") {
    const deluserInfo = await DelUser.find({}); //Book is from where is it from database (deluser)

    if (!deluserInfo) {
      return res.send({ message: "No book in DB!" });
    }
    console.log(deluserInfo);
    return res.send({ message: "Data found", data: deluserInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

//latest-books

app.post("/get-latest-books", async (req, res) => {
  try {
    const latestBooks = await TBook.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (most recent first)
      .limit(5); // Limit the result to 5 documents
    res.json({ data: latestBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/get-dbcollections", async (req, res) => {
  const { books } = await req.body;
  console.log(books);
  try {
    // if (books == "books") {
    const bookInfo = await TBook.find({});

    if (!bookInfo) {
      return res.send({ message: "No book in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: bookInfo });
    // }
  } catch (error) {
    console.log(error);
  }
});

//edit-audiobooks
app.post(
  "/edit-audiobook",
  upload.fields([
    { name: "audioBkImage", maxCount: 1 },
    { name: "audioBkCon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { audioBkName, audioAuthName, audioBkGenre, audioDesp } = req.body;

      const audioBkImage = req.files["audioBkImage"]
        ? req.files["audioBkImage"][0]
        : null;
      const audioBkCon = req.files["audioBkCon"]
        ? req.files["audioBkCon"][0]
        : null;

      const audiobookInfo = await Audiobook.findOne({
        audioBkName: audioBkName,
      });

      if (!audiobookInfo) {
        return res.send({ message: "book doesn't exists!" });
      }

      // console.log(
      //   audioBkName,
      //   audioAuthName,
      //   audioBkGenre,
      //   audioDesp,
      //   audioBkImage,
      //   audioBkCon
      // );

      if (audioAuthName) audiobookInfo.audioAuthName = audioAuthName;
      if (audioBkGenre) audiobookInfo.audioBkGenre = audioBkGenre;
      if (audioDesp) audiobookInfo.audioDesp = audioDesp;

      let audioBkImagePath = "";
      let audioBkConPath = "";

      if (audioBkImage && audioBkImage.originalname) {
        const bufferaudioBkImage = audioBkImage.buffer;
        const audioBkImagePathPublic = `../client/public/users/audioBookCover/${
          audioBkName + "_" + audioBkImage.originalname
        }`; //why is ` used??
        await writeFile(audioBkImagePathPublic, bufferaudioBkImage);

        audioBkImagePath = `/users/audioBookCover/${
          audioBkName + "_" + audioBkImage.originalname
        }`;
        audiobookInfo.audioBkImage = audioBkImagePath;
      }

      if (audioBkCon && audioBkCon.originalname) {
        const bufferaudioBkCon = audioBkCon.buffer;
        const audioBkConPathPublic = `../client/public/users/audioBookCon/${
          audioBkName + "_" + audioBkCon.originalname
        }`;
        await writeFile(audioBkConPathPublic, bufferaudioBkCon);

        audioBkConPath = `/users/audioBookCon/${
          audioBkName + "_" + audioBkCon.originalname
        }`;
        audiobookInfo.audioBkCon = audioBkConPath;
      }

      await audiobookInfo.save();

      return res.send({
        message: "Audiobook edited Successfully!",
        status: "ok",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

//delete Audiobook
const delAudiobookSchema = new mongoose.Schema(
  {
    audioBkName: {
      type: String,
      required: true,
    },
    audioAuthName: {
      type: String,
      required: true,
    },
    audioBkImage: {
      type: String,
      required: true,
    },
    audioBkGenre: {
      type: String,
      required: true,
    },
    audioDesp: {
      type: String,
      required: true,
    },
    audioBkCon: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DelAudiobook = new mongoose.model("DelAudiobook", delAudiobookSchema);

app.post("/delaudiobook", async (req, res) => {
  try {
    const { audioBkName } = req.body;
    console.log(audioBkName);
    const audiobookExist = await Audiobook.findOne({
      audioBkName: audioBkName,
    });
    console.log(audiobookExist);
    if (!audiobookExist) {
      return res.send({ message: "book doesn't exists!" });
    }

    const delaudiobook = new DelAudiobook({
      audioBkName: audiobookExist.audioBkName,
      audioAuthName: audiobookExist.audioAuthName,
      audioBkImage: audiobookExist.audioBkImage,
      audioBkGenre: audiobookExist.audioBkGenre,
      audioDesp: audiobookExist.audioDesp,
      audioBkCon: audiobookExist.audioBkCon,
    });

    await delaudiobook.save();

    await Audiobook.deleteOne({ audioBkName });

    return res.send({ message: "book deleted successfully !", status: "del" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/get-user", async (req, res) => {
  const { email, username } = req.body;
  // console.log(username);
  try {
    let userInfo;
    if (username) {
      userInfo = await User.findOne({ username });
    } else {
      userInfo = await User.findOne({ email });
    }

    if (!userInfo) {
      return res.send({ message: "User doesn't exist!", status: 400 });
    }
    return res.send({
      message: "User data found",
      status: "ok",
      user: userInfo,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/get-username", async (req, res) => {
  const { username } = req.query; // Use req.query to access query parameters for GET requests

  console.log(username);

  try {
    const user = await User.findOne({ username });
    if (user) {
      res.json({ user: user });
    } else {
      res.status(404).json({ message: "User doesn't exist!" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

app.post("/update-name", async (req, res) => {
  const { userId, name } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name: name } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Name updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user name:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.post("/update-username", async (req, res) => {
  const { userId, username } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { username: username },
      { new: true }
    );
    if (user) {
      res.json({ message: "Username updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating the username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post(
  "/upload-user-pfp",
  upload.fields([{ name: "profileimage", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { username } = req.body;
      const profileimage = req.files["profileimage"]
        ? req.files["profileimage"][0]
        : null;

      const userExist = await User.findOne({ username });
      if (!userExist) {
        return res.send({ message: "User doesn't exist!" });
      }

      if (profileimage && profileimage.originalname) {
        const bufferPfp = profileimage.buffer;
        // Dynamically construct the file path
        const pfpPathPublic = path.join(
          __dirname,
          "..",
          "client",
          "public",
          "users",
          "profileImages",
          `${username}_${profileimage.originalname}`
        );

        await writeFile(pfpPathPublic, bufferPfp).catch((error) => {
          console.error("Error saving file:", error);
          throw new Error("Failed to save profile photo");
        });

        // Construct the path for accessing the image via URL
        const pfpPath = `/users/profileImages/${username}_${profileimage.originalname}`;

        // Update the user's profile image path in the database
        userExist.profileimage = pfpPath;
        await userExist.save();

        return res.send({ message: "Profile photo updated successfully" });
      } else {
        return res.status(400).send({ message: "No profile image provided" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ error: "Internal Server Error", details: error.message });
    }
  }
);

//change user password
// app.post("changing-password", async (req, res) => {
//   try {
//     const { userId, oldPassword, newPassword } = req.body;

//     // Find the user by ID
//     const user = await User.findById(userId);

//     // Check if the user exists
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the old password matches the user's current password
//     const passwordMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!passwordMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     // Update the user's password with the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
//     user.password = hashedPassword;

//     // Save the updated user object to the database
//     await user.save();

//     // Alert the user when password is successfully changed
//     return res.json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

//test book
const testbookSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    bkName: {
      type: String,
      required: true,
    },
    authName: {
      type: String,
      required: true,
    },
    bkGenre: {
      type: String,
      required: true,
    },
    bkDesp: {
      type: String,
      required: true,
    },
    bkImagePath: {
      type: String,
      required: true,
    },
    chapters: [
      {
        title: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
      },
    ],
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "User",
        },
        username: {
          type: String,
          required: false,
        },
        rating: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const TBook = mongoose.model("TBook", testbookSchema);

app.post(
  "/test-addbooks",
  upload.fields([{ name: "bkImage", maxCount: 1 }]),
  async (req, res) => {
    const { role, bkName, authName, bkGenre, bkDesp } = req.body;

    const bkImage = req.files["bkImage"] ? req.files["bkImage"][0] : null;

    const bookInfo = await TBook.findOne({
      bkName,
    });

    if (bookInfo) {
      return res.send({ message: "Book already there!" });
    }

    let bkImagePath = "/assets/logoExplore.png";

    if (bkImage && bkImage.originalname) {
      const bufferbkImage = bkImage.buffer;
      const bkImagePathPublic = `../client/public/users/bookCover/${
        bkName + "_" + bkImage.originalname
      }`;
      await writeFile(bkImagePathPublic, bufferbkImage);

      bkImagePath = `/users/bookCover/${bkName + "_" + bkImage.originalname}`;
    }
    const newBook = new TBook({
      role,
      bkName,
      authName,
      bkGenre,
      bkDesp,
      bkImagePath,
      // chapters: [],
    });

    await newBook.save();
    return res.send({ message: "Added Book Successfully!", status: "ok" });
  }
);

//rating
app.post("/submit-rating", async (req, res) => {
  const { bkName, username, userId, rating } = req.body;
  try {
    const book = await TBook.findOne({ bkName });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the user has already rated, update rating if so, else add new rating
    const existingRatingIndex = book.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (existingRatingIndex !== -1) {
      book.ratings[existingRatingIndex].rating = rating;
    } else {
      book.ratings.push({ userId, username, rating });
    }
    await book.save();
    res.json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting rating", error });
  }
});

//comments
const commentSchema = new mongoose.Schema({
  profileimage: {
    type: String,
    required: true,
    default: "/assets/booksanime-ezgif.com-crop.gif",
  },
  bkName: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

app.post("/submit-comment", async (req, res) => {
  const { bkName, profileimage, username, comment } = req.body;

  try {
    const newComment = new Comment({
      bkName,
      profileimage,
      username,
      comment,
    });

    await newComment.save();
    res.json({ message: "Comment added successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.toString() });
  }
});

app.get("/comments/:bkName", async (req, res) => {
  const { bkName } = req.params;

  try {
    const comments = await Comment.find({ bkName }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.toString() });
  }
});

//get comment
app.post("/get-comment", async (req, res) => {
  const { comments } = await req.body;
  console.log(comments);
  try {
    // if (books == "books") {
    const commentInfo = await Comment.find({}); //Book is from where is it from database (user)

    if (!commentInfo) {
      return res.send({ message: "No comment in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: commentInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

//delete comment
const delCommentSchema = new mongoose.Schema(
  {
    bkName: { type: String, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DelComment = new mongoose.model("DelComment", delCommentSchema);

app.post("/delcomment", async (req, res) => {
  try {
    const { _id } = req.body;
    // console.log(bkname);
    const commentExist = await Comment.findOne({ _id: _id });

    if (!commentExist) {
      return res.send({ message: "Comment doesn't exists!" });
    }

    const delcomment = new DelComment({
      bkName: commentExist.bkName,
      username: commentExist.username,
      comment: commentExist.comment,
      createdAt: commentExist.createdAt,
    });

    await delcomment.save();

    await Comment.deleteOne({ _id });

    return res.send({
      message: "comment deleted successfully !",
      status: "del",
    });
  } catch (error) {
    console.log(error);
  }
});

// app.post("/text-addbookchp", async (req, res) => {
app.post("/text-addbookchp", async (req, res) => {
  const { bkName, title, content } = await req.body;
  console.log(req.body);
  // console.log(bkName, title, content);
  try {
    const bookInfo = await TBook.findOne({ bkName });

    if (!bookInfo) {
      return res.send({ message: "Book not found" });
    }

    // let id;
    // if (bookInfo.chapters.length > 0) {
    //   // Find the maximum id among existing chapters and increment it
    //   id = Math.max(...bookInfo.chapters.map((chapter) => chapter.id)) + 1;
    // } else {
    //   id = 1;
    // }

    // const newChapter = { id, title, content };
    const newChapter = { title, content };
    bookInfo.chapters.push(newChapter);

    await bookInfo.save();

    return res.send({ message: "Chapter added successfully!", status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//edit chapter
app.post("/edit-chp", async (req, res) => {
  try {
    const { bkName, oldtitle, oldcontent, title, content } = req.body;
    console.log(title, content);
    console.log(bkName, oldtitle);
    const bookInfo = await TBook.findOneAndUpdate(
      { bkName: bkName, "chapters.title": oldtitle },
      {
        $set: {
          "chapters.$.title": title ? title : oldtitle,
          "chapters.$.content": content ? content : oldcontent,
        },
      },
      { new: true } // Return the modified document
    );
    console.log(bookInfo);

    if (!bookInfo) {
      return res.send({ message: "book doesn't exists!" });
    }
    await bookInfo.save();
    return res.send({ message: "Book edited Successfully!", status: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
app.post("/del-chp", async (req, res) => {
  try {
    const { bkName, title } = req.body;
    console.log(bkName, title);
    const bookInfo = await TBook.findOneAndUpdate(
      { bkName: bkName, "chapters.title": title },
      {
        $pull: {
          chapters: { title: title },
        },
      },
      { new: true } // Return the modified document
    );
    console.log(bookInfo);

    if (!bookInfo) {
      return res.send({ message: "book doesn't exists!" });
    }
    await bookInfo.save();

    return res.send({ message: "Book deleted Successfully!", status: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//latest-user
app.post("/get-latest-users", async (req, res) => {
  try {
    const latestUsers = await User.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (most recent first)
      .limit(10); // Limit the result to 10 documents
    res.json({ data: latestUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//user-delete
const delUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profileimage: { type: String, required: false },
    role: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, required: true, default: false }, // Indicates premium status
    expiryDate: { type: String, required: false }, // Indicates premium expiry
    role2: { type: String, required: true, default: "user" }, // New field for premium status
  },
  { timestamps: true }
);

const DelUser = new mongoose.model("DelUser", delUserSchema);

app.post("/deluser", async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(bkname);
    const userExist = await User.findOne({ email: email });

    if (!userExist) {
      return res.send({ message: "User doesn't exists!" });
    }

    const deluser = new DelUser({
      name: userExist.name,
      profileimage: userExist.profileimage,
      role: userExist.role,
      username: userExist.username,
      gender: userExist.gender,
      dob: userExist.dob,
      email: userExist.email,
      password: userExist.password,
      isPremium: userExist.isPremium,
      expiryDate: userExist.expiryDate,
      role2: userExist.role2,
    });

    await deluser.save();

    await User.deleteOne({ email });

    return res.send({ message: "user deleted successfully !", status: "del" });
  } catch (error) {
    console.log(error);
  }
});

//edit-user
app.post("/edit-user", async (req, res) => {
  try {
    const { name, username, role, isPremium, gender, dob, email, password } =
      req.body;

    console.log(email);
    // const bkImg = req.files["bkImg"] ? req.files["bkImg"][0] : null;
    // const bkCon = req.files["bkCon"] ? req.files["bkCon"][0] : null;

    const userInfo = await User.findOne({ email });
    if (!userInfo) {
      return res.send({ message: "user doesn't exists!" });
    }

    // if (username) userInfo.username = username;
    // if (isPremium) userInfo.isPremium = isPremium;
    if (password) userInfo.password = password;
    if (name) userInfo.name = name;
    if (role) userInfo.role = role;
    if (gender) userInfo.gender = gender;
    if (dob) userInfo.dob = dob;

    // let bkImgPath = "";
    // // let bkConPath = "";

    // if (bkImg && bkImg.originalname) {
    //   const bufferBkImg = bkImg.buffer;
    //   const bkImgPathPublic = `../client/public/users/bookCover/${
    //     bkName + "_" + bkImg.originalname
    //   }`;
    //   await writeFile(bkImgPathPublic, bufferBkImg);

    //   bkImgPath = `/users/bookCover/${bkName + "_" + bkImg.originalname}`;
    //   userInfo.bkimage = bkImgPath;
    // }

    await userInfo.save();

    return res.send({
      message: "User details edited Successfully!",
      status: "ok",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//for fetching random 3 books and display in home
app.get("/get-random-books", async (req, res) => {
  try {
    // Adjust 'Book' to match your actual Mongoose model
    const randomBooks = await TBook.aggregate([{ $sample: { size: 3 } }]);
    return res.send({ message: "Data found", data: randomBooks });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// favraite books
// Endpoint to add a book to favorites
app.post("/add-to-favorites", async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is already in favorites
    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      await user.save();
      res.json({ message: "Book added to favorites" });
    } else {
      res.status(400).json({ message: "Book is already in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding book to favorites",
      error: error.toString(),
    });
  }
});
// Endpoint to remove a book from favorites
app.post("/remove-from-favorites", async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is in favorites before attempting to remove it
    if (user.favorites.includes(bookId)) {
      user.favorites.pull(bookId); // mongoose method to remove item from array
      await user.save();
      res.json({ message: "Book removed from favorites" });
    } else {
      res.status(400).json({ message: "Book is not in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error removing book from favorites",
      error: error.toString(),
    });
  }
});
app.post("/is-favorited", async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorited = user.favorites.includes(bookId);
    res.json({ isFavorited });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  }
});

app.get("/user-favorites/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching favorite books",
      error: error.toString(),
    });
  }
});

//handel premium

const paymentDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isPremium: {
      type: Boolean,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentDetail = new mongoose.model("PaymentDetail", paymentDetailSchema);

app.post("/store-payment-details", async (req, res) => {
  // console.log("Received payment details:", req.body);
  try {
    const { userId, username, paymentId, plan, date, amount, currency } =
      req.body;
    const pdfPath = `receipts/${paymentId}.pdf`; // Path where the PDF receipt will be saved

    // Format the date for display
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    // Ensure the receipts directory exists
    const receiptsDir = path.join(__dirname, "receipts");
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir);
    }

    // Generate PDF receipt
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(24).text("Payment Receipt", 100, 80);
    doc.fontSize(16).moveDown().text(`Date: ${formattedDate}`, 100);
    doc.text(`Payment ID: ${paymentId}`, 100);
    doc.text(`Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`, 100);
    doc.text(`Amount: ${plan === "monthly" ? "₹49" : "₹499"}`, 100);
    doc.end();

    // Store payment details
    let expiryDate = new Date();
    if (req.body.plan === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (req.body.plan === "annual") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    console.log(expiryDate);
    const readableAmount = `${currency} ${parseInt(amount) / 100}`;

    const paymentDetail = new PaymentDetail({
      userId: req.body.userId,
      username: req.body.username,
      paymentId: req.body.paymentId,
      plan: req.body.plan,
      date: req.body.date,
      amount: req.body.amount,
      currency: req.body.currency,
      isPremium: true,
      expiryDate, // Make sure your schema supports this
    });

    await paymentDetail.save();
    await User.findByIdAndUpdate(userId, {
      $set: { role2: "premium", isPremium: true, expiryDate },
    });

    // Return the expiry date in the response
    res.json({
      message: "Subscription successful",
      expiryDate: expiryDate.toISOString(), // Send expiryDate back to the client
    });

    // Setup nodemailer transporter as provided
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true, // Note: `secure` should be false for port 587, true for port 465
      auth: {
        user: "explorethebooks3002@gmail.com", // Your Gmail address
        pass: "wnhg tmnr rrvm noty", // Your Gmail password or App Password
      },
    });

    const updatedUser = await User.findOne({ _id: userId });
    const userEmail = updatedUser.email;

    // Email content for payment receipt
    const mailOptions = {
      from: "explorethebooks3002@gmail.com", // Sender address
      to: userEmail, // Recipient email from the updated user document
      subject: "Payment Receipt - Explore Premium Subscription",
      html: `<p>Hello Reader !!</p>
        <p>You are now an EXPLORE Premium user :)</p>
        <p>You can now use all our premium features.</p>
        <p>Please download your attached payment receipt.</p>`,
      attachments: [
        {
          filename: "PaymentReceipt.pdf",
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({
          message: "Failed to send receipt email",
          error: err.toString(),
        });
      } else {
        console.log("Email sent: " + info.response);
        res.json({
          message:
            "Payment details stored, user updated to premium, and receipt sent successfully.",
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.toString() });
  }
});

app.listen(3001, () => {
  console.log("\nBE started at port 3001");
});

//models
app.get("/api/book-count-by-genre", async (req, res) => {
  try {
    const data = await TBook.aggregate([
      {
        $group: {
          _id: "$bkGenre",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
//get payment-details
app.post("/get-payment", async (req, res) => {
  const { payments } = await req.body;
  console.log(payments);
  try {
    // if (books == "books") {
    const paymentInfo = await PaymentDetail.find({}); //Book is from where is it from database (user)

    if (!paymentInfo) {
      return res.send({ message: "No magazine in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: paymentInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

////magazine fea
//rating
app.post("/magsubmit-rating", async (req, res) => {
  const { magName, username, userId, rating } = req.body;
  try {
    const magazine = await Magazine.findOne({ magName });
    if (!magazine) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the user has already rated, update rating if so, else add new rating
    const existingRatingIndex = book.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (existingRatingIndex !== -1) {
      magazine.ratings[existingRatingIndex].rating = rating;
    } else {
      magazine.ratings.push({ userId, username, rating });
    }
    await magazine.save();
    res.json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting rating", error });
  }
});

//comments
const mgcommentSchema = new mongoose.Schema({
  profileimage: {
    type: String,
    required: true,
    default: "/assets/booksanime-ezgif.com-crop.gif",
  },
  magName: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MgComment = mongoose.model("mgComment", mgcommentSchema);

app.post("/magsubmit-comment", async (req, res) => {
  const { magName, profileimage, username, comment } = req.body;

  try {
    const newComment = new MgComment({
      magName,
      profileimage,
      username,
      comment,
    });

    await newComment.save();
    res.json({ message: "Comment added successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.toString() });
  }
});

app.get("/magcomments/:magName", async (req, res) => {
  const { magName } = req.params;

  try {
    const comments = await MgComment.find({ magName }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.toString() });
  }
});

//get comment
app.post("/magget-comment", async (req, res) => {
  const { comments } = await req.body;
  console.log(comments);
  try {
    // if (books == "books") {
    const commentInfo = await MgComment.find({}); //Book is from where is it from database (user)

    if (!commentInfo) {
      return res.send({ message: "No comment in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: commentInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

app.post("/magadd-to-favorites", async (req, res) => {
  const { userId, magazineId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is already in favorites
    if (!user.mgfavorites.includes(magazineId)) {
      user.mgfavorites.push(magazineId);
      await user.save();
      res.json({ message: "Book added to favorites" });
    } else {
      res.status(400).json({ message: "Book is already in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding book to favorites",
      error: error.toString(),
    });
  }
});
// Endpoint to remove a book from favorites
app.post("/magremove-from-favorites", async (req, res) => {
  const { userId, magazineId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is in favorites before attempting to remove it
    if (user.mgfavorites.includes(magazineId)) {
      user.mgfavorites.pull(magazineId); // mongoose method to remove item from array
      await user.save();
      res.json({ message: "Book removed from favorites" });
    } else {
      res.status(400).json({ message: "Book is not in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error removing book from favorites",
      error: error.toString(),
    });
  }
});
app.post("/magis-favorited", async (req, res) => {
  const { userId, magazineId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorited = user.mgfavorites.includes(magazineId);
    res.json({ isFavorited });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  }
});
app.get("/user-mgfavorites/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("mgfavorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ mgfavorites: user.mgfavorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching magazine favorite books",
      error: error.toString(),
    });
  }
});





////audio book fea 
//rating
app.post("/adsubmit-rating", async (req, res) => {
  const { audioBkName, username, userId, rating } = req.body;
  try {
    const book = await Audiobook.findOne({  });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the user has already rated, update rating if so, else add new rating
    const existingRatingIndex = book.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (existingRatingIndex !== -1) {
      book.ratings[existingRatingIndex].rating = rating;
    } else {
      book.ratings.push({ userId, username, rating });
    }
    await book.save();
    res.json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting rating", error });
  }
});

//comments
const adcommentSchema = new mongoose.Schema({
  profileimage: {
    type: String,
    required: true,
    default: "/assets/booksanime-ezgif.com-crop.gif",
  },
  audioBkName: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AdComment = mongoose.model("adComment", adcommentSchema);

app.post("/adsubmit-comment", async (req, res) => {
  const { audioBkName, profileimage, username, comment } = req.body;

  try {
    const newComment = new AdComment({
      audioBkName,
      profileimage,
      username,
      comment,
    });

    await newComment.save();
    res.json({ message: "Comment added successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.toString() });
  }
});

app.get("/adcomments/:audioBkName", async (req, res) => {
  const { audioBkName } = req.params;

  try {
    const comments = await AdComment.find({ audioBkName }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.toString() });
  }
});

//get comment
app.post("/adget-comment", async (req, res) => {
  const { comments } = await req.body;
  console.log(comments);
  try {
    // if (books == "books") {
    const commentInfo = await AdComment.find({}); //Book is from where is it from database (user)

    if (!commentInfo) {
      return res.send({ message: "No comment in DB!" });
    }
    // console.log(bookInfo);
    return res.send({ message: "Data found", data: commentInfo }); // data used from and where
    // }
  } catch (error) {
    console.log(error);
  }
});

app.post("/adadd-to-favorites", async (req, res) => {
  const { userId, audiobookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is already in favorites
    if (!user.adfavorites.includes(audiobookId)) {
      user.adfavorites.push(audiobookId);
      await user.save();
      res.json({ message: "Book added to favorites" });
    } else {
      res.status(400).json({ message: "Book is already in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding book to favorites",
      error: error.toString(),
    });
  }
});
// Endpoint to remove a book from favorites
app.post("/adremove-from-favorites", async (req, res) => {
  const { userId, audiobookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is in favorites before attempting to remove it
    if (user.adfavorites.includes(audiobookId)) {
      user.adfavorites.pull(audiobookId); // mongoose method to remove item from array
      await user.save();
      res.json({ message: "Book removed from favorites" });
    } else {
      res.status(400).json({ message: "Book is not in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error removing book from favorites",
      error: error.toString(),
    });
  }
});
app.post("/adis-favorited", async (req, res) => {
  const { userId, audiobookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorited = user.adfavorites.includes(audiobookId);
    res.json({ isFavorited });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  }
});
