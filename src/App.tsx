import SmoothScrollProvider from './components/SmoothScrollProvider'
import CustomCursor from './components/CustomCursor'
import Header from './components/Header'
import Footer from './components/Footer'
import HeroSection from './sections/HeroSection'
import AboutSection from './sections/AboutSection'
import IncludedSection from './sections/IncludedSection'
import ContactSection from './sections/ContactSection'

function App() {
  return (
    <SmoothScrollProvider>
      <CustomCursor />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <IncludedSection />
        <ContactSection />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}

export default App
