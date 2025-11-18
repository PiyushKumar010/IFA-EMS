import React from "react";
import { useNavigate } from "react-router-dom";

// Decorative dot component
function Dot({ top, left, color, size }) {
  return (
    <div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        background: color,
        borderRadius: "999px",
        opacity: 0.12,
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(2px)",
      }}
    />
  );
}

const roles = [
  {
    name: "Admin",
    color: "#387efb",
    desc: "Control, manage, and view all EMS data.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 42 42" fill="none">
        <circle cx="21" cy="21" r="19" fill="#387efb" opacity="0.14" />
        <path d="M21 7l7 3v6.9c0 6.6-3.9 10.3-6.7 11.5a1.6 1.6 0 0 1-1.3 0c-2.8-1.2-6.7-4.9-6.7-11.5V10L21 7z" fill="#387efb" stroke="#387efb" strokeWidth="2"/>
        <path d="M21 24.6v-7.3" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/>
      </svg>
    ),
    tag: { text: "MVP", color: "#387efb" }
  },
  {
    name: "Employee",
    color: "#19b37a",
    desc: "View projects, post updates, track training.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 42 42" fill="none">
        <circle cx="21" cy="21" r="19" fill="#19b37a" opacity="0.14" />
        <path d="M21 27c-5.4 0-10.1 2.2-10.1 4.7V34h20.2v-2.3c0-2.5-4.7-4.7-10.1-4.7z" fill="#19b37a"/>
        <circle cx="21" cy="18" r="4.2" fill="#19b37a"/>
      </svg>
    ),
    tag: { text: "Popular", color: "#19b37a" }
  },
  {
    name: "Client",
    color: "#f76902",
    desc: "Track project progress in real-time.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 42 42" fill="none">
        <circle cx="21" cy="21" r="19" fill="#f76902" opacity="0.14" />
        <path d="M21 16a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 14.2c-2.6 0-7-1.2-7-3.7v-1.6A3.2 3.2 0 0117 22c2 1.4 6 1.4 8 0a3.2 3.2 0 013 2.9v1.6c0 2.5-4.4 3.7-7 3.7z" fill="#f76902"/>
      </svg>
    ),
    tag: { text: "Live", color: "#f76902" }
  },
];

// Tag chip for highlights
function Tag({ text, color }) {
  return (
    <span style={{
      position: "absolute",
      top: 19,
      right: 23,
      background: color,
      color: "#fff",
      borderRadius: "9px",
      fontSize: "0.7rem",
      fontWeight: 700,
      padding: "6px 13px",
      zIndex: 3,
      boxShadow: "0 2px 8px #0002",
      letterSpacing: "1px"
    }}>
      {text}
    </span>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
        overflow: "hidden",
        background: "radial-gradient(circle at 70% 15%, #387efb14 0%, #fff 70%), linear-gradient(120deg,#ece9ff 0%, #f8f9fa 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}
    >
      {/* Decorative Dots */}
      <Dot top={22} left={7} color="#387efb" size={48}/>
      <Dot top={79} left={11} color="#19b37a" size={39}/>
      <Dot top={67} left={88} color="#f76902" size={42}/>
      <Dot top={38} left={95} color="#387efb" size={36}/>
      {/* Heading & Subtitle */}
      <h1 style={{
        fontSize: "3.2rem",
        fontWeight: 900,
        color: "#22223b",
        textAlign: "center",
        letterSpacing: 2,
        textShadow: "0 0 12px #e8e9fa75"
      }}>
        Employee Monitoring System
      </h1>
      <div style={{
        fontWeight: 500,
        color: "#387efbcc",
        marginBottom: 62,
        letterSpacing: "0.8px",
        fontSize:"1.13rem",
        textAlign: "center"
      }}>
        Select your role to continue
      </div>
      {/* Role Cards */}
      <div style={{
        display: "flex",
        gap: "90px",
        justifyContent: "center",
        alignItems: "flex-start",
        marginBottom: "8px",
        flexWrap: "wrap",
        zIndex: 2,
      }}>
        {roles.map((role) => (
          <div
            key={role.name}
            onClick={() => navigate("/verify", { state: { role: role.name.toLowerCase() } })}
            style={{
              background: "rgba(255,255,255,0.89) linear-gradient(120deg,#fff7,#eaf3fd 120%)",
              borderRadius: "24px",
              width: 276,
              minHeight: 219,
              boxShadow: `0 8px 38px ${role.color}15, 0 2px 48px #0001`,
              backdropFilter: "blur(2px)",
              border: `2px solid ${role.color}26`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              cursor: "pointer",
              padding: "42px 16px 30px 16px",
              marginBottom: 0,
              justifyContent: "flex-start",
              transition: "transform 0.22s, box-shadow 0.22s",
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = "scale(1.065)";
              e.currentTarget.style.boxShadow = `0 16px 54px ${role.color}44, 0 2px 48px #0002`;
              e.currentTarget.style.borderColor = role.color;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = `0 8px 38px ${role.color}15, 0 2px 48px #0001`;
              e.currentTarget.style.border = `2px solid ${role.color}26`;
            }}
          >
            {role.tag && <Tag text={role.tag.text} color={role.tag.color} />}
            <div style={{marginBottom:14, marginTop:4}}>
              {role.icon}
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: "1.35rem",
              color: role.color,
              marginBottom: 9,
              letterSpacing: 1,
              textShadow: `0 1px 8px ${role.color}44`,
            }}>
              {role.name}
            </span>
            <span style={{
              fontSize: "0.99rem",
              color: "#454545c4",
              textAlign: "center",
              fontWeight: 500,
              marginTop:6,
            }}>
              {role.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
