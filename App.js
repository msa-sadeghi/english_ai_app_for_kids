import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import axios from 'axios';

const { width } = Dimensions.get('window');

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const letterPronunciations = {
  A: 'ey', B: 'bee', C: 'see', D: 'dee', E: 'ee',
  F: 'ef', G: 'jee', H: 'aitch', I: 'eye', J: 'jay',
  K: 'kay', L: 'el', M: 'em', N: 'en', O: 'oh',
  P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee',
  U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee',
};

const UNSPLASH_ACCESS_KEY = 'BSFyVHyyXvcovbayMXOziSY3NgJUotmYT-rWDoOE6Cw';

export default function App() {
  const [word, setWord] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState();

  const handleLetterPress = async (letter) => {
    setWord((prev) => prev + letter);
    setImageUri(null);
    // Speech.speak(letterPronunciations[letter]);
    //TODO
    Speech.speak(letter);
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/click.wav')
    );
    setSound(sound);
    await sound.playAsync();
  };

  const handleClear = () => {
    setWord('');
    setImageUri(null);
  };

  const handleSpeakWord = () => {
    if (word) Speech.speak(word);
  };

  const generateImage = async () => {
    if (!word) return;
    try {
      setLoading(true);
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: word, per_page: 1 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });
      if (response.data.results.length > 0) {
        const image = response.data.results[0].urls.small;
        // console.log('آدرس تصویر:', image); // این رو اضافه کن
        setImageUri(image);
      } else {
        alert('No image found. Try another word.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.wordCard} onPress={handleSpeakWord}>
          <Text style={styles.wordText}>{word || '...'}</Text>
          <Text style={styles.hint}>👆 Tap to speak the word</Text>
        </TouchableOpacity>

        <View style={styles.lettersContainer}>
          {letters.map((letter) => {
            const scale = useSharedValue(1);
            const animatedStyle = useAnimatedStyle(() => {
              return {
                transform: [{ scale: scale.value }],
              };
            });

            const handlePress = () => {
              scale.value = withSpring(1.3);
              setTimeout(() => (scale.value = withSpring(1)), 150);
              handleLetterPress(letter);
            };

            return (
                <TouchableOpacity onPress={handlePress}>
              <Animated.View key={letter} style={[styles.letterButton, animatedStyle]}>
                  <Text style={styles.letterText}>{letter}</Text>
              </Animated.View>
                </TouchableOpacity>
            );
          })}
        </View>

        {loading && <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />}

        {imageUri && (
         
          
          
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
         
          
        )}
      </ScrollView>

      <View style={styles.fixedButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={generateImage}>
          <Text style={styles.buttonText}>Show Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  wordCard: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    width: width - 40,
    alignItems: 'center',
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  hint: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
 letterButton: {
   backgroundColor: '#AEEEEE',
  margin: 10,
  borderRadius: 16,
  width: (width - 80) / 6, // 4 حرف در هر ردیف با فاصله
  height: 90,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 3,
  shadowColor: '#000',
},
  letterText: {
     fontSize: 30,
  fontWeight: 'bold',
  color: '#000',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 30,
    borderRadius: 20,
  },
  fixedButtons: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  actionButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
