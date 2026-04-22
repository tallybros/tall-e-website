@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&family=Oxanium:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-sans: 'Oxanium', sans-serif;
    --font-zen-dots: 'Zen Dots', sans-serif;
    --font-orbitron: 'Orbitron', sans-serif;

    --background: 0 0% 4%;
    --foreground: 0 0% 96%;
    --card: 0 0% 7%;
    --card-foreground: 0 0% 96%;
    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 96%;
    --primary: 264 66% 61%;
    --primary-foreground: 0 0% 100%;
    --secondary: 181 80% 47%;
    --secondary-foreground: 0 0% 4%;
    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 55%;
    --accent: 264 66% 61%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 16%;
    --input: 0 0% 16%;
    --ring: 264 65% 62%;
    --chart-1: 264 65% 62%;
    --chart-2: 160 60% 62%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.75rem;
    --sidebar-background: 0 0% 6%;
    --sidebar-foreground: 0 0% 96%;
    --sidebar-primary: 264 66% 61%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 0 0% 96%;
    --sidebar-border: 60 8% 15%;
    --sidebar-ring: 264 66% 61%;
  }

  .dark {
    --background: 0 0% 4%;
    --foreground: 0 0% 96%;
    --card: 0 0% 7%;
    --card-foreground: 0 0% 96%;
    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 96%;
    --primary: 264 66% 61%;
    --primary-foreground: 0 0% 100%;
    --secondary: 181 80% 47%;
    --secondary-foreground: 0 0% 4%;
    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 55%;
    --accent: 264 66% 61%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 16%;
    --input: 0 0% 16%;
    --ring: 264 66% 61%;
    --chart-1: 264 66% 61%;
    --chart-2: 160 60% 62%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 0 0% 6%;
    --sidebar-foreground: 0 0% 96%;
    --sidebar-primary: 264 66% 61%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 0 0% 96%;
    --sidebar-border: 0 0% 16%;
    --sidebar-ring: 264 66% 61%;
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans;
  }
}

html {
  scroll-behavior: smooth;
}