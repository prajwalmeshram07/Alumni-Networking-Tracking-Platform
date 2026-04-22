# Aluminaye – Alumni Networking & Tracking Platform

**Aluminaye** is a comprehensive MERN-stack platform designed to bridge the gap between college alumni, current students, and administrators. Similar to LinkedIn, it offers powerful networking tools tailored specifically to educational institutions.

---

## 1. Architecture (Frontend, Backend, Database)

The platform follows a traditional three-tier **MERN** architecture:

- **Frontend (Client-Side - React.js + Vite):** A responsive Single Page Application (SPA) providing a fast, dynamic user experience. Routing is managed by `react-router-dom`, context/state manages user data, and styling uses **Tailwind CSS**. It communicates with the backend via REST APIs (Axios) and maintains persistent WebSocket connections (Socket.io-client) for real-time features.
- **Backend (Server-Side - Node.js + Express.js):** A lightweight API layer handling business logic, authentication (JWT), and real-time signalling using `socket.io`. It includes structured MVC routing (Models, Controllers, Routes) for clean separation of concerns.
- **Database (Data Layer - MongoDB):** A document-based NoSQL database managed through Mongoose Object Data Modeling (ODM). It effectively maps real-world models (User, Post, Job, Message) into scalable schema structures.

---

## 2. Key Features and How They Work

### User Profiles & Networking (LinkedIn-like)
Users can register as *Students*, *Alumni*, or *Admins*. The authentication module hashes passwords with `bcrypt` and generates `JWT`s for protected routes. Once logged in, users can create Posts in the Social Feed, containing content and images. Other users can like and comment on these posts, fostering engagement.

### Alumni Tracking via Interactive Map
The backend stores Location objects (`lat`, `lng`) on user schemas. The frontend Map component (using Mapbox/Google Maps) parses these geolocations, allowing students to filter alumni globally based on variables like company or domain.

### Jobs & Referrals
Alumni can add listings to the Job Board using a structured API route (`POST /api/jobs`). Students query this database (`GET /api/jobs`) and click to apply or request a referral, fostering streamlined mentorship and opportunity tracking.

### Real-Time Chat & Video Calling
Instead of polling the database repeatedly, Aluminaye leverages **Socket.io**. As soon as a user sends a message, an event is emitted from the client, bounced through the Express server via WebSockets, and instantly dispatched to the recipient. For Video Calling, WebRTC is utilized for peer-to-peer media sharing, while Socket.io functions purely as a signaling server to exchange connection credentials (SDP offers/answers).

---

## 3. Technologies Used

- **MongoDB / Mongoose**: Flexible, schema-based NoSQL database configuration.
- **Express / Node.js**: Fast, non-blocking HTTP backend server framework.
- **React.js / Vite**: Component-based UI library bundled with blazing-fast Vite ecosystem.
- **Tailwind CSS / Lucide-React**: Utility-first CSS classes combined with sleek vector icons.
- **Socket.io**: Real-time event-driven communication (chat, signaling).
- **WebRTC**: Real-time browser-to-browser audio/video streams.
- **Bcrypt / JSONWebToken**: Cryptographic hashing and secure stateless API authentication.

---

## 4. Real-World Use Case

**College Placement & Alumni Cells:**
Often, students struggle to find relevant alumni for career guidance, relying on scattered LinkedIn searches. **Aluminaye** creates an exclusive, verified internal hub. For example, a student looking to transition into *Data Science in Berlin* can simply open the interactive map, filter for alumni located in Germany working as Data Scientists, and initiate an immediate real-time chat or video call, resulting in a highly effective mentorship and referral channel.

---

## 5. Challenges and Scalability

### Challenges
- **Real-Time Data State Logging:** Keeping Socket.io active connections synchronized with UI state cleanly requires excellent state management to prevent memory leaks or duplicate messages.
- **P2P Video Complexity:** WebRTC can struggle with strict corporate/campus firewalls (NAT traversals), requiring the addition of STUN/TURN servers to relay video reliably between peers.

### Scalability Strategies
- **Database Indexing:** As the user base climbs, queries sorting feeds/jobs can become slow. Implementing indexing on Mongoose properties (like `createdAt` or `company`) will drastically speed up queries.
- **Load Balancing WebSockets:** If traffic spikes significantly, a single Node server cannot handle all Socket.io traffic. The backend can be scaled horizontally across multiple instances using Redis Pub/Sub as an adapter to broadcast messages across servers.
- **Media Optimization:** Using CDNs (like Cloudinary) directly unburdens the main Express server from large image uploads.
