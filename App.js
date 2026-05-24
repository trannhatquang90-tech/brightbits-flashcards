import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Vibration, Alert, ScrollView, Animated, PanResponder } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';

const flashcards = [
  { emoji: '🐶', word: 'Dog', pronunciation: '/dɔɡ/', translation: 'Chó' },
  { emoji: '🐱', word: 'Cat', pronunciation: '/kæt/', translation: 'Mèo' },
  { emoji: '🐘', word: 'Elephant', pronunciation: '/ˈel.ə.fənt/', translation: 'Voi' },
  { emoji: '🐬', word: 'Dolphin', pronunciation: '/ˈdɑː.lˌfɪn/', translation: 'Cá Heo' },
  { emoji: '🐒', word: 'Monkey', pronunciation: '/ˈmʌn.ki/', translation: 'Khỉ' },
  { emoji: '🐰', word: 'Rabbit', pronunciation: '/ˈræb.ɪt/', translation: 'Thỏ' },
  { emoji: '🐢', word: 'Turtle', pronunciation: '/ˈtɜːr.təl/', translation: 'Rùa' },
  { emoji: '🦁', word: 'Lion', pronunciation: '/ˈlaɪ.ən/', translation: 'Sư Tử' },
  { emoji: '🐧', word: 'Penguin', pronunciation: '/ˈpeŋ.ɡwɪn/', translation: 'Chim Cánh Cụt' },
  { emoji: '🦒', word: 'Giraffe', pronunciation: '/dʒəˈræf/', translation: 'Hươu Cao Cổ' },
];

const topics = [
  { id: 'animal', name: '🐾 Animal', icon: '🐾', locked: false },
  { id: 'vehicle', name: '🚗 Vehicle', icon: '🚗', locked: true },
  { id: 'food', name: '🍎 Food', icon: '🍎', locked: true },
  { id: 'home', name: '🏠 Home', icon: '🏠', locked: true },
];

const languageOptions = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeTopic, setActiveTopic] = useState('animal');
  const [currentLang, setCurrentLang] = useState('vi');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const triggerHaptic = () => Vibration.vibrate(30);
  const currentCard = flashcards[currentIndex];
  
  const displayText = currentLang === 'en' ? currentCard.word : currentCard.translation;
  
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      Speech.speak(displayText, { language: currentLang === 'en' ? 'en-US' : 'vi-VN', rate: 0.9 });
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex, displayText, currentLang]);
  
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
  
  const speakCurrent = () => {
    Speech.speak(displayText, { language: currentLang === 'en' ? 'en-US' : 'vi-VN', rate: 0.9 });
  };
  
  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (Math.abs(dx) > 50) {
          if (dx > 0) {
            handlePrev(); // Swipe right - previous
          } else {
            handleNext(); // Swipe left - next
          }
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BrightBits</Text>
        
        {/* Language Selector */}
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
                  <Text>{lang.flag} {lang.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Horizontal Scrollable Topic Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.topicScroll}
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
        
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 Streak: {streak}</Text>
          </View>
        )}
      </View>

      {/* Card with Side Navigation */}
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

      {/* Text Section */}
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

      {/* Progress Dots */}
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
    right: 0,
  },
  langFlag: {
    fontSize: 24,
  },
  langDropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  langOption: {
    padding: 10,
    paddingHorizontal: 15,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginRight: 8,
  },
  topicBtnActive: {
    backgroundColor: '#ff6b6b',
  },
  topicBtnLocked: {
    opacity: 0.5,
  },
  topicBtnText: {
    fontSize: 15,
    color: '#666',
  },
  streakBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    marginTop: 10,
  },
  streakText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 40,
  },
  sideNavBtn: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 18,
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
    fontSize: 20,
    color: '#4a5568',
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 50,
    position: 'relative',
  },
  card: {
    width: '100%',
    aspectRatio: 0.667, // 4:6
    borderRadius: 22,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  shadowLayer1: {
    top: 12,
    backgroundColor: 'rgba(255,107,107,0.3)',
    zIndex: 1,
  },
  shadowLayer2: {
    top: 25,
    backgroundColor: 'rgba(255,165,2,0.2)',
    zIndex: 0,
  },
  cardImage: {
    flex: 1,
    backgroundColor: '#ddd',
  },
  textSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#ff6b6b',
    width: 30,
    borderRadius: 6,
  },
});