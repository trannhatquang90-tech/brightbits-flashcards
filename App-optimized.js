import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Vibration, Alert, ScrollView, Animated, PanResponder } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';

/* RESEARCH-BACKED FLASHCARDS FOR TODDLERS (2-4 YEARS) */
const flashcards = [
  { emoji: '🐶', word: 'Dog', translation: 'Chó' },
  { emoji: '🐱', word: 'Cat', translation: 'Mèo' },
  { emoji: '🐘', word: 'Elephant', translation: 'Voi' },
  { emoji: '🐬', word: 'Dolphin', translation: 'Cá Heo' },
  { emoji: '🐒', word: 'Monkey', translation: 'Khỉ' },
  { emoji: '🐰', word: 'Rabbit', translation: 'Thỏ' },
  { emoji: '🐢', word: 'Turtle', translation: 'Rùa' },
  { emoji: '🦁', word: 'Lion', translation: 'Sư Tử' },
  { emoji: '🐧', word: 'Penguin', translation: 'Cánh Cụt' },
  { emoji: '🦒', word: 'Giraffe', translation: 'Hươu' },
];

/* SIMPLIFIED TOPICS - ONE ACTIVE FOR FOCUS */
const topics = [
  { id: 'animal', name: '🐾 Animal', locked: false },
];

const languageOptions = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTopic, setActiveTopic] = useState('animal');
  const [currentLang, setCurrentLang] = useState('vi');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const triggerHaptic = () => Vibration.vibrate(50); /* Longer vibration for kids */
  const currentCard = flashcards[currentIndex];
  
  const displayText = currentLang === 'en' ? currentCard.word : currentCard.translation;
  
  /* ANIMATION */
  const animateCardChange = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 10, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };
  
  /* REMOVED AUTO-SPEAK - RESEARCH: Image first, then user-initiated audio */
  const handlePrev = () => {
    triggerHaptic();
    setCurrentIndex(prev => {
      const newIndex = prev - 1;
      return newIndex < 0 ? flashcards.length - 1 : newIndex;
    });
    animateCardChange();
  };
  
  const handleNext = () => {
    triggerHaptic();
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= flashcards.length ? 0 : newIndex;
    });
    animateCardChange();
  };
  
  const handleTopicSelect = (topicId, locked) => {
    if (locked) {
      Alert.alert('🔒 Locked!', 'Upgrade to BrightBits Pro to unlock more topics!');
    } else {
      setActiveTopic(topicId);
    }
  };
  
  /* SPEAK - User initiated only (research-backed) */
  const speakCurrent = () => {
    Speech.speak(displayText, { 
      language: currentLang === 'en' ? 'en-US' : 'vi-VN', 
      rate: 0.9,
      pitch: 1.1 
    });
  };
  
  /* SWIPE GESTURE */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (Math.abs(dx) > 50) {
          if (dx > 0) {
            handlePrev();
          } else {
            handleNext();
          }
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER - Simplified */}
      <View style={styles.header}>
        <Text style={styles.title}>BrightBits 🐾</Text>
        
        {/* Language Selector - Larger for kids */}
        <View style={styles.langSelector}>
          <TouchableOpacity onPress={() => setShowLangDropdown(!showLangDropdown)}>
            <Text style={styles.langFlag}>
              {currentLang === 'en' ? '🇺🇸' : '🇻🇳'}
            </Text>
          </TouchableOpacity>
          
          {showLangDropdown && (
            <View style={styles.langDropdown}>
              {languageOptions.map(lang => (
                <TouchableOpacity
                  key={lang.id}
                  style={styles.langOption}
                  onPress={() => {
                    setCurrentLang(lang.id);
                    setShowLangDropdown(false);
                  }}
                >
                  <Text style={styles.langOptionText}>{lang.flag} {lang.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      
      {/* TOPIC BAR - Single active topic for focus */}
      <View style={styles.topicScroll}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicSelector}
        >
          {topics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicBtn,
                activeTopic === topic.id && styles.topicBtnActive,
                topic.locked && styles.topicBtnLocked
              ]}
              onPress={() => handleTopicSelect(topic.id, topic.locked)}
            >
              <Text style={styles.topicBtnText}>
                {topic.name} {topic.locked && '🔒'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CARD - LARGE TOUCH TARGET */}
      <View style={styles.cardWrapper}>
        <TouchableOpacity 
          style={[styles.sideNavBtn, styles.sideNavLeft]} 
          onPress={handlePrev}
        >
          <Text style={styles.sideNavText}>◀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sideNavBtn, styles.sideNavRight]} 
          onPress={handleNext}
        >
          <Text style={styles.sideNavText}>▶</Text>
        </TouchableOpacity>
        
        <View style={styles.cardContainer}>
          {/* Shadow layers */}
          <View style={[styles.card, styles.shadowLayer2]} />
          <View style={[styles.card, styles.shadowLayer1]} />
          <Animated.View 
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
            {...panResponder.panHandlers}
            onStartShouldSetResponder={() => true}
            onResponderRelease={speakCurrent}
          >
            <View style={styles.cardImage} />
          </Animated.View>
        </View>
      </View>

      {/* TEXT SECTION - LARGE FONT */}
      <View style={styles.textSection}>
        <Animated.Text 
          style={[
            styles.word,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {displayText}
        </Animated.Text>
      </View>

      {/* PROGRESS DOTS - Larger */}
      <View style={styles.dotsContainer}>
        {flashcards.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8edea',
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    color: '#4a5568',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  langSelector: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  langFlag: {
    fontSize: 32, /* Larger for kids */
  },
  langDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 100,
  },
  langOption: {
    padding: 12,
    paddingHorizontal: 16,
  },
  langOptionText: {
    fontSize: 18,
  },
  topicScroll: {
    width: '100%',
    marginBottom: 15,
  },
  topicSelector: {
    paddingHorizontal: 10,
    gap: 12,
  },
  topicBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginRight: 8,
  },
  topicBtnActive: {
    backgroundColor: '#ff6b6b',
  },
  topicBtnLocked: {
    opacity: 0.5,
  },
  topicBtnText: {
    fontSize: 16,
    color: '#666',
  },
  
  /* CARD STYLES - Updated for research */
  cardWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 30,
  },
  sideNavBtn: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -36 }], /* Centered on card */
    width: 72, /* Minimum for toddler hands */
    height: 72,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 10,
  },
  sideNavLeft: {
    left: 0,
  },
  sideNavRight: {
    right: 0,
  },
  sideNavText: {
    fontSize: 32,
    color: '#4a5568',
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 80, /* Space for nav buttons */
    position: 'relative',
  },
  card: {
    width: '100%',
    aspectRatio: 0.667,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  shadowLayer1: {
    top: 8,
    backgroundColor: 'rgba(255,107,107,0.4)',
    zIndex: 1,
  },
  shadowLayer2: {
    top: 16,
    backgroundColor: 'rgba(255,165,2,0.3)',
    zIndex: 0,
  },
  cardImage: {
    flex: 1,
    backgroundColor: '#ddd',
  },
  
  /* TEXT SECTION - Larger for kids */
  textSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  word: {
    fontSize: 36, /* Larger font for readability */
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
  },
  
  /* DOTS - Larger for kids */
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 16, /* Larger dots */
    height: 16,
    borderRadius: 50,
    backgroundColor: 'white',
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: '#ff6b6b',
    width: 24,
    borderRadius: 12,
  },
});