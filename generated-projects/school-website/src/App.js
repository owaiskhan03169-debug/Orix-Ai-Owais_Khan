var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var programs = [
    'Foundational learning for Nursery to Grade 2',
    'STEM labs, robotics, and project-based science',
    'Arts, sports, debate, music, and leadership clubs'
];
var stats = [
    { label: 'Students', value: '1,200+' },
    { label: 'Teachers', value: '85' },
    { label: 'Years', value: '28' }
];
function App() {
    return (_jsxs("main", { children: [_jsxs("section", __assign({ className: "hero" }, { children: [_jsxs("nav", __assign({ className: "nav" }, { children: [_jsxs("div", __assign({ className: "brand" }, { children: [_jsx("span", __assign({ className: "brand-mark" }, { children: "S" })), _jsx("span", { children: "Sunrise Public School" })] })), _jsxs("div", __assign({ className: "links" }, { children: [_jsx("a", __assign({ href: "#programs" }, { children: "Programs" })), _jsx("a", __assign({ href: "#campus" }, { children: "Campus" })), _jsx("a", __assign({ href: "#contact" }, { children: "Contact" }))] }))] })), _jsxs("div", __assign({ className: "hero-grid" }, { children: [_jsxs("div", __assign({ className: "hero-copy" }, { children: [_jsx("p", __assign({ className: "eyebrow" }, { children: "Admissions open 2026" })), _jsx("h1", { children: "Where curiosity becomes confidence." }), _jsx("p", __assign({ className: "lead" }, { children: "A modern school website for a vibrant learning community with academics, co-curricular growth, safe campus life, and parent-first communication." })), _jsxs("div", __assign({ className: "actions" }, { children: [_jsx("a", __assign({ className: "button primary", href: "#contact" }, { children: "Apply Now" })), _jsx("a", __assign({ className: "button secondary", href: "#programs" }, { children: "Explore Programs" }))] }))] })), _jsxs("div", __assign({ className: "notice-card" }, { children: [_jsx("h2", { children: "Upcoming Events" }), _jsxs("ul", { children: [_jsx("li", { children: "Science exhibition: May 18" }), _jsx("li", { children: "Parent orientation: May 24" }), _jsx("li", { children: "Sports trials: June 3" })] })] }))] }))] })), _jsx("section", __assign({ className: "stats", "aria-label": "School highlights" }, { children: stats.map(function (item) { return (_jsxs("div", { children: [_jsx("strong", { children: item.value }), _jsx("span", { children: item.label })] }, item.label)); }) })), _jsxs("section", __assign({ id: "programs", className: "section" }, { children: [_jsxs("div", { children: [_jsx("p", __assign({ className: "eyebrow" }, { children: "Programs" })), _jsx("h2", { children: "Balanced academics with real-world skills" })] }), _jsx("div", __assign({ className: "program-grid" }, { children: programs.map(function (program) { return (_jsxs("article", __assign({ className: "program-card" }, { children: [_jsx("span", { className: "dot" }), _jsx("p", { children: program })] }), program)); }) }))] })), _jsx("section", __assign({ id: "campus", className: "campus" }, { children: _jsxs("div", { children: [_jsx("p", __assign({ className: "eyebrow" }, { children: "Campus Life" })), _jsx("h2", { children: "Designed for learning, play, and wellbeing" }), _jsx("p", { children: "Smart classrooms, a library commons, turf field, maker lab, infirmary, and secure transport make every day structured and full of discovery." })] }) })), _jsxs("section", __assign({ id: "contact", className: "contact" }, { children: [_jsxs("div", { children: [_jsx("p", __assign({ className: "eyebrow" }, { children: "Contact" })), _jsx("h2", { children: "Book a campus visit" }), _jsx("p", { children: "Call +91 98765 43210 or email admissions@sunriseschool.edu" })] }), _jsxs("form", { children: [_jsx("input", { "aria-label": "Parent name", placeholder: "Parent name" }), _jsx("input", { "aria-label": "Phone number", placeholder: "Phone number" }), _jsx("button", __assign({ type: "button" }, { children: "Request Callback" }))] })] }))] }));
}
export default App;
