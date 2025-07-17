import "./App.css"; // นำเข้าไฟล์ CSS สำหรับกำหนดสไตล์ของคอมโพเนนต์ App

import React, { useState, useEffect } from "react"; // นำเข้า React Hooks:
// useState: สำหรับจัดการสถานะ (state) ในคอมโพเนนต์
// useEffect: สำหรับจัดการผลข้างเคียง (side effects) เช่น การเรียก API เมื่อคอมโพเนนต์โหลด

import { supabase } from "./createClient"; // นำเข้า Supabase client ที่ถูกตั้งค่าไว้จากไฟล์ 'createClient.js'
// Supabase client นี้จะใช้ในการเชื่อมต่อและโต้ตอบกับฐานข้อมูล Supabase

const App = () => {
  //console.log(import.meta.env.VITE_SUPABASE_URL);

  // 🔽 State สำหรับเก็บรายการผู้ใช้ทั้งหมดที่ดึงมาจาก Supabase
  // users: ตัวแปร state ที่เก็บข้อมูลผู้ใช้ (เริ่มต้นเป็น array ว่างเปล่า)
  // setUsers: ฟังก์ชันสำหรับอัปเดตค่าของ users state
  const [users, setUsers] = useState([]);

  // 🔽 State สำหรับเก็บข้อมูลผู้ใช้ที่กำลังกรอกในฟอร์มสำหรับ "สร้างผู้ใช้ใหม่"
  // user: object ที่มี property 'name' และ 'age' (เริ่มต้นเป็น string ว่างเปล่าทั้งคู่)
  // setUser: ฟังก์ชันสำหรับอัปเดตค่าของ user state
  // นี่คือ Controlled component: ค่าใน input fields จะถูกควบคุมโดย state นี้
  const [user, setUser] = useState({
    name: "",
    age: "",
  });

  // 🔽 State สำหรับเก็บข้อมูลผู้ใช้ที่กำลังกรอกในฟอร์มสำหรับ "แก้ไขผู้ใช้"
  // user2: object ที่มี property 'id', 'name' และ 'age' (เริ่มต้นเป็น string ว่างเปล่า)
  // setUser2: ฟังก์ชันสำหรับอัปเดตค่าของ user2 state
  const [user2, setUser2] = useState({
    id: "",
    name: "",
    age: "",
  });

  // 🔽 State ใหม่: เก็บ ID ของผู้ใช้ที่กำลังจะแก้ไข
  // editUserId: เก็บ ID ของผู้ใช้ที่กำลังถูกเลือกเพื่อแก้ไข (เริ่มต้นเป็น null หมายถึงไม่ได้อยู่ในโหมดแก้ไข)
  // setEditUserId: ฟังก์ชันสำหรับอัปเดตค่าของ editUserId state
  const [editUserId, setEditUserId] = useState(null);

  // 🔽 useEffect Hook: ทำงานเมื่อคอมโพเนนต์ App ถูก mount (โหลดขึ้นมา) ครั้งแรกเท่านั้น
  // ใช้สำหรับดึงข้อมูลผู้ใช้จาก Supabase ทันทีที่หน้าเว็บโหลด
  useEffect(() => {
    fetchUser(); // เรียกฟังก์ชัน fetchUser เพื่อดึงข้อมูล
  }, []); // 👈 [] (dependency array ว่างเปล่า) หมายความว่า useEffect จะทำงานเพียงครั้งเดียวเมื่อคอมโพเนนต์โหลดเสร็จ

  // 🔽 ฟังก์ชัน async: ดึงข้อมูลผู้ใช้ทั้งหมดจากตาราง 'users' ใน Supabase
  async function fetchUser() {
    try {
      // 💡 ใช้ try...catch เพื่อจัดการข้อผิดพลาดที่อาจเกิดขึ้นระหว่างการดึงข้อมูล
      const { data, error } = await supabase
        .from("users") // ระบุตารางที่ต้องการดึงข้อมูลคือ 'users'
        .select("*"); // เลือกทุกคอลัมน์จากตาราง 'users'

      if (error) {
        throw error; // ถ้ามี error จาก Supabase ให้โยน error นั้นออกไป
      }

      // 💡 ตั้งค่า users state ด้วยข้อมูลที่ได้มา หรือ array ว่างเปล่าถ้า data เป็น null/undefined
      setUsers(data || []);
      // console.log(data); // ⚠️ สามารถลบ console.log นี้ออกได้เมื่อไม่ต้องการตรวจสอบแล้ว
    } catch (error) {
      // แสดงข้อผิดพลาดใน console หากเกิดข้อผิดพลาดในการดึงข้อมูล
      console.error("Error fetching users:", error.message);
    }
  }

  // 🔽 ฟังก์ชันจัดการการเปลี่ยนแปลงค่าใน input fields สำหรับฟอร์ม "สร้างผู้ใช้ใหม่" (เป็น Generic handler)
  // อัปเดต 'user' state ตามชื่อ (name) ของ input ที่กำลังเปลี่ยนแปลง
  function handleChange(event) {
    const { name, value } = event.target; // 💡 Destructure เพื่อดึง 'name' และ 'value' จาก event.target ทำให้โค้ดอ่านง่ายขึ้น
    setUser((prevFormData) => {
      // ใช้ functional update เพื่อให้แน่ใจว่าได้ค่า state ล่าสุด
      return {
        ...prevFormData, // คัดลอกคุณสมบัติเดิมทั้งหมดของ prevFormData
        [name]: value, // อัปเดตเฉพาะคุณสมบัติที่ตรงกับชื่อของ input ด้วยค่าใหม่
      };
    });
  }

  // 🔽 ฟังก์ชันจัดการการเปลี่ยนแปลงค่าใน input fields สำหรับฟอร์ม "แก้ไขผู้ใช้"
  // อัปเดต 'user2' state ตามชื่อ (name) ของ input ที่กำลังเปลี่ยนแปลง
  function handleChange2(event) {
    const { name, value } = event.target; // 💡 Destructure เพื่อดึง 'name' และ 'value' จาก event.target
    setUser2((prevFormData) => {
      // ใช้ functional update เพื่อให้แน่ใจว่าได้ค่า state ล่าสุด
      return {
        ...prevFormData, // คัดลอกคุณสมบัติเดิมทั้งหมดของ prevFormData
        [name]: value, // อัปเดตเฉพาะคุณสมบัติที่ตรงกับชื่อของ input ด้วยค่าใหม่
      };
    });
  }

  // 🔽 ฟังก์ชัน async: สร้างผู้ใช้ใหม่และบันทึกลง Supabase
  // ถูกเรียกเมื่อฟอร์ม "สร้างผู้ใช้ใหม่" ถูก submit
  async function createUser(event) {
    event.preventDefault(); // 🛑 สำคัญ: ป้องกันการรีเฟรชหน้าเว็บเมื่อฟอร์มถูก submit (พฤติกรรมเริ่มต้นของฟอร์ม HTML)

    // 💡 ตรวจสอบความถูกต้องของข้อมูลเบื้องต้นก่อนส่ง (Basic validation)
    if (!user.name || !user.age) {
      alert("Please enter both name and age."); // แจ้งเตือนผู้ใช้หากข้อมูลไม่ครบ
      return; // หยุดการทำงานถ้าข้อมูลไม่ครบ
    }

    try {
      // 🔽 ส่งข้อมูล { name, age } ไปยังตาราง 'users' ใน Supabase
      const { data, error } = await supabase
        .from("users") // ระบุตารางปลายทางคือ 'users'
        .insert({ name: user.name, age: user.age }) // ข้อมูลที่จะ insert
        .select(); // 💡 เพิ่ม .select() เพื่อให้ Supabase คืนข้อมูลที่เพิ่ง insert มา (เช่น id ที่ถูกสร้างขึ้นอัตโนมัติ)

      if (error) {
        throw error; // ถ้ามี error จาก Supabase ให้โยน error นั้นออกไป
      }

      console.log("User created successfully:", data); // แสดงข้อมูลที่สร้างใน console
      alert("User created successfully!"); // แสดงข้อความแจ้งเตือนความสำเร็จให้ผู้ใช้ทราบ

      fetchUser(); // 🔄 เรียกฟังก์ชัน fetchUser เพื่ออัปเดตข้อมูลในตารางหลังจากเพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว

      setUser({ name: "", age: "" }); // 🗑️ ล้างฟอร์มหลังจาก submit สำเร็จ เพื่อเตรียมพร้อมสำหรับการกรอกครั้งถัดไป
    } catch (error) {
      console.error("Error creating user:", error.message); // บันทึก error ใน console
      alert("Error creating user: " + error.message); // แสดงข้อความ error ให้ผู้ใช้ทราบ
    }
  }

  // 🔽 ฟังก์ชัน async: สำหรับลบข้อมูลผู้ใช้จาก Supabase
  async function deleteUser(userId) {
    // 👈 รับ userId เป็นพารามิเตอร์เพื่อระบุผู้ใช้ที่จะลบ
    // ถามผู้ใช้ยืนยันก่อนลบ เพื่อป้องกันการลบโดยไม่ได้ตั้งใจ
    // ⚠️ Note: ใน production ควรใช้ Modal/Dialog ที่กำหนดเองแทน window.confirm()
    if (
      !window.confirm(
        `Are you sure you want to delete user with ID: ${userId}?`
      )
    ) {
      return; // ถ้าผู้ใช้กดยกเลิก ก็หยุดการทำงาน
    }

    try {
      const { data, error } = await supabase
        .from("users") // ระบุตาราง 'users'
        .delete() // คำสั่งลบข้อมูล
        .eq("id", userId); // 👈 ระบุเงื่อนไขการลบ: ลบแถวที่คอลัมน์ 'id' ตรงกับค่า 'userId' ที่ส่งมา

      if (error) {
        throw error;
      }

      alert(`User with ID: ${userId} was successfully deleted!`); // แจ้งเตือนความสำเร็จ
      fetchUser(); // 🔄 เรียก fetchUser เพื่ออัปเดตตารางหลังจากลบข้อมูลแล้ว
    } catch (error) {
      console.error("Error deleting user:", error.message); // บันทึก error ใน console
      alert("Error deleting user: " + error.message); // แสดงข้อความ error ให้ผู้ใช้ทราบ
    }
  }

  // 🔽 ฟังก์ชันสำหรับแสดงข้อมูลผู้ใช้ที่เลือกในฟอร์มแก้ไข
  function displayUser(userId) {
    users.map((user) => {
      // วนลูปผ่านรายการผู้ใช้ทั้งหมด
      if (user.id == userId)
        // ถ้าเจอ user ที่มี id ตรงกัน
        setUser2({ id: user.id, name: user.name, age: user.age }); // ตั้งค่า user2 state ด้วยข้อมูลของผู้ใช้นั้น
    });
  }

  // 🔽 ฟังก์ชัน async: สำหรับอัปเดตข้อมูลผู้ใช้ใน Supabase
  async function updateUser(userId) {
    const { data, error } = await supabase
      .from("users") // ระบุตาราง 'users'
      .update({ id: user2.id, name: user2.name, age: user2.age }) // ข้อมูลที่จะอัปเดต
      .eq("id", userId); // ระบุเงื่อนไขการอัปเดต: อัปเดตแถวที่คอลัมน์ 'id' ตรงกับค่า 'userId' ที่ส่งมา

    if (error) {
      console.error("Error updating user:", error.message); // บันทึก error ใน console
      // อาจจะแสดงข้อความแจ้งเตือนผู้ใช้ เช่น alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      return; // หยุดการทำงานถ้ามีข้อผิดพลาด
    }

    console.log("User updated successfully:", data); // แสดงข้อมูลที่อัปเดตใน console
    fetchUser(); // 🔄 เรียก fetchUser เพื่ออัปเดตตารางหลังจากอัปเดตข้อมูลแล้ว
  }

  return (
    <div>
      {/* 🔽 ฟอร์มสำหรับกรอกข้อมูลผู้ใช้ใหม่ */}
      {/* เมื่อ submit ฟอร์ม จะเรียกฟังก์ชัน createUser */}
      <form onSubmit={createUser}>
        <input
          type="text"
          placeholder="Name"
          name="name" // ชื่อของ input field ตรงกับ property ใน user state
          onChange={handleChange} // เมื่อค่าใน input เปลี่ยนแปลง จะเรียก handleChange
          value={user.name} // 🔑 Controlled component: ค่าของ input ถูกควบคุมโดย user.name state
        />
        <input
          type="number"
          placeholder="Age"
          name="age" // ชื่อของ input field ตรงกับ property ใน user state
          onChange={handleChange} // เมื่อค่าใน input เปลี่ยนแปลง จะเรียก handleChange
          value={user.age} // 🔑 Controlled component: ค่าของ input ถูกควบคุมโดย user.age state
        />
        <button type="submit">Create User</button>{" "}
        {/* ปุ่มสำหรับส่งข้อมูลฟอร์ม */}
      </form>

      {/* � ฟอร์มสำหรับแก้ไขข้อมูลผู้ใช้ */}
      {/* เมื่อ submit ฟอร์ม จะเรียกฟังก์ชัน updateUser โดยส่ง ID ของผู้ใช้ที่กำลังแก้ไขไป */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateUser(user2.id);
        }}
      >
        <input
          type="text"
          placeholder="Name"
          name="name"
          onChange={handleChange2} // ใช้ handleChange2 สำหรับฟอร์มแก้ไข
          value={user2.name} // ค่าของ input ถูกควบคุมโดย user2.name state
        />
        <input
          type="number"
          placeholder="Age"
          name="age"
          onChange={handleChange2} // ใช้ handleChange2 สำหรับฟอร์มแก้ไข
          value={user2.age} // ค่าของ input ถูกควบคุมโดย user2.age state
        />
        <button type="submit">Save Changes</button>{" "}
        {/* ปุ่มสำหรับบันทึกการเปลี่ยนแปลง */}
      </form>

      {/* 🔽 ตารางสำหรับแสดงรายการผู้ใช้ที่ดึงมาจาก Supabase */}
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* 🔽 วนลูปแสดงข้อมูลผู้ใช้แต่ละคนในตาราง */}
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.age}</td>
              <td>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
                <button onClick={() => displayUser(user.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App; // ส่งออกคอมโพเนนต์ App เพื่อให้สามารถนำไปใช้งานในไฟล์อื่นได้ (เช่น ใน index.js)
