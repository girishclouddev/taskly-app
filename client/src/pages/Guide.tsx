import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, Wand2, BellRing, Route, Smartphone, Code, Video, LayoutDashboard } from "lucide-react";

export default function Guide() {
    const [search, setSearch] = useState("");
    const [showNotif, setShowNotif] = useState(false);
    const [showAdd, setShowAdd] = useState(false); // Just a dummy for this isolated page if no AddTask modal is mounted, or we can just redirect to Home for Add

    const handleOpenAdd = () => {
        window.location.href = "/";
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const features = [
        {
            title: "Smart Auto-Categorization",
            icon: Wand2,
            color: "text-purple-500",
            bg: "bg-purple-500/10 border-purple-500/20",
            gradient: "from-purple-500/10",
            description: "Just type naturally! Taskly will detect keywords in your task title like 'Meeting', 'Design', 'Code', 'Bug', or 'Marketing' and automatically theme your task with beautiful colors and dynamic icons."
        },
        {
            title: "Precision Reminders",
            icon: BellRing,
            color: "text-blue-500",
            bg: "bg-blue-500/10 border-blue-500/20",
            gradient: "from-blue-500/10",
            description: "Set a date and time, and Taskly will queue a precision alarm. When the time strikes, you will get an immersive Push Notification and a browser alarm sound instantly."
        },
        {
            title: "Magic Redirects",
            icon: Route,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            gradient: "from-emerald-500/10",
            description: "Clicked notification? Taskly will immediately focus your browser tab, find the exact page your task is on (even if it's on page 3!), scroll right to it, and trigger a pulsing glow animation. All while keeping the URL beautifully clean."
        },
        {
            title: "Raw Premium Dashboard",
            icon: LayoutDashboard,
            color: "text-pink-500",
            bg: "bg-pink-500/10 border-pink-500/20",
            gradient: "from-pink-500/10",
            description: "Your workspace is powered by fluid Framer Motion animations, glassmorphism UI, frosted glass borders, and giant subtle background icons that react to your mouse hover natively."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                search={search}
                onSearchChange={setSearch}
                onOpenAdd={handleOpenAdd}
                onOpenNotifications={() => setShowNotif(true)}
            />

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-float-in pb-24">

                {/* Header Section */}
                <div className="mt-6 mb-12 text-center max-w-2xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-sm"
                    >
                        <Sparkles className="h-8 w-8 text-purple-500" />
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 pb-1">
                        How to Use Taskly
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Welcome to the most stunning, raw, and fluid task management experience. Here is everything you need to know to master your workflow.
                    </p>
                </div>

                {/* Features Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div key={idx} variants={item} className="h-full">
                                <Card className={`group relative h-full flex flex-col justify-between overflow-hidden shadow-premium hover-elevate transition-all duration-300 border backdrop-blur-xl bg-gradient-to-br to-background/90 rounded-2xl ${feature.gradient}`}>

                                    {/* Giant floating background icon */}
                                    <div className={`absolute -bottom-6 -right-6 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none ${feature.color}`}>
                                        <Icon className="h-40 w-40" />
                                    </div>

                                    <div className="relative z-10 p-6 sm:p-8">
                                        <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border mb-6 shadow-sm bg-background/50 backdrop-blur-md ${feature.bg} ${feature.color}`}>
                                            <Icon className="h-7 w-7" />
                                        </div>

                                        <h3 className="text-2xl font-bold tracking-tight mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-[15px]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Bottom CTA Area */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-12 text-center"
                >
                    <Card className="p-8 sm:p-12 overflow-hidden relative shadow-premium-lg border-primary/20 bg-gradient-to-br from-indigo-500/5 via-primary/5 to-purple-500/5 backdrop-blur-xl rounded-3xl">
                        <div className="relative z-10 flex flex-col items-center">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">Ready to get organized?</h2>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">Hit the Add Task button in the top right to create your first themed task, or press the magical floating action button on mobile.</p>

                            <button
                                onClick={handleOpenAdd}
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium px-8 py-3 rounded-xl shadow-lg shadow-purple-500/25 hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <Sparkles className="h-5 w-5" /> Let's Go!
                            </button>
                        </div>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
