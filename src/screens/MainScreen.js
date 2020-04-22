import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Vibration,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Easing} from 'react-native-reanimated';
import {ReanimatedArc} from '@callstack/reanimated-arc';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const easing = Easing.inOut(Easing.quad);

const colors = {
  mainBackgroundColor: '#202020',
  innerArcBackgroundColor: '#2F3133',
  primary: '#4D5FDE',
  secondary: '#3a7bd5',
  alert: '#EE4641',
  defaultWhite: '#fff',
};

const VIBRATION_DIFF = 400;
const VIBRATION_PATTERN = [
  1 * VIBRATION_DIFF,
  2 * VIBRATION_DIFF,
  3 * VIBRATION_DIFF,
];

const MainScreen = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTimeText, setCurrentTimeText] = useState('00:00:00');
  const [stopWatchActive, setStopWatchActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [arcSweepAngle, setArcSweepAngle] = useState(0);

  useEffect(() => {
    setCurrentTimeText(
      new Date(currentTime * 1000).toISOString().substr(11, 8),
    );
    if (stopWatchActive) {
      const timeOut1 = setTimeout(() => {
        if (currentTime < 1) {
          setStopWatchActive(false);
          setTimerComplete(true);
          Vibration.vibrate(VIBRATION_PATTERN, true);
        } else {
          setCurrentTime(currentTime - 1);
        }
      }, 1000);

      return () => {
        clearTimeout(timeOut1);
      };
    }
  }, [currentTime, stopWatchActive]);

  const startStopWatch = () => {
    setArcSweepAngle(arcSweepAngle === 0 ? 360 / currentTime : arcSweepAngle);
    setStopWatchActive(true);
  };

  const stopStopWatch = () => {
    setStopWatchActive(false);
  };

  const resetStopWatch = () => {
    setArcSweepAngle(0);
    setCurrentTime(0);
    setStopWatchActive(false);
    setTimerComplete(false);
  };

  const addTime = (time) => {
    setArcSweepAngle(0);
    setTimerComplete(false);
    setCurrentTime(currentTime + time);
  };

  const dismissTimer = () => {
    Vibration.cancel();
    setTimerComplete(false);
  };

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.container}>
        <ReanimatedArc
          color="lightgrey"
          diameter={195}
          width={2}
          arcSweepAngle={360}
          lineCap="round"
          initialAnimation={false}
        />
        <View style={styles.innerArc}></View>
        <ReanimatedArc
          color={
            currentTime < 6 && stopWatchActive ? colors.alert : colors.primary
          }
          diameter={200}
          width={10}
          lineCap="round"
          initialAnimation={false}
          style={styles.absolute}
          easing={easing}
          animationDuration={200}
          arcSweepAngle={currentTime * arcSweepAngle}
        />
        <Text
          style={[
            styles.absolute,
            styles.timeText,
            {
              color:
                currentTime < 6 && currentTime > 0
                  ? colors.alert
                  : colors.defaultWhite,
            },
          ]}>
          {currentTimeText}
        </Text>
      </View>
      <View style={styles.timePicker}>
        <TimePickerButton time={10} unit="min" addTime={addTime} />
        <TimePickerButton time={1} unit="min" addTime={addTime} />
        <TimePickerButton time={15} unit="sec" addTime={addTime} />
      </View>
      <View style={styles.buttonContainer}>
        {stopWatchActive ? (
          <RoundedButton title="pause" onPress={stopStopWatch} />
        ) : (
          <RoundedButton
            title="play"
            onPress={startStopWatch}
            type={currentTime === 0 ? 'disabled' : ''}
          />
        )}
        <RoundedButton title="undo" onPress={resetStopWatch} />
      </View>
      {timerComplete && (
        <View style={styles.dismissButtons}>
          <RoundedButton title="close" type="dismiss" onPress={dismissTimer} />
          <Text
            style={{color: colors.defaultWhite, fontSize: 18, marginTop: 8}}>
            DISMISS
          </Text>
        </View>
      )}
    </View>
  );
};

const RoundedButton = (props) => {
  const {onPress, type} = props;
  const gradientColors =
    type === 'disabled'
      ? ['#829abf', '#aebbcf']
      : type === 'dismiss'
      ? [colors.primary, colors.alert]
      : [colors.primary, colors.secondary];
  return (
    <TouchableWithoutFeedback onPress={onPress} disabled={type === 'disabled'}>
      <LinearGradient style={styles.roundedButton} colors={gradientColors}>
        <Icon name={props.title} size={24} color={colors.defaultWhite} />
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const TimePickerButton = (props) => {
  const {time, unit} = props;
  let timeToAdd = unit === 'min' ? time * 60 : time;
  return (
    <View style={styles.timePickerButtonWrapper}>
      <TouchableWithoutFeedback
        onPress={() => {
          props.addTime(timeToAdd);
        }}>
        <View style={styles.timePickerButton}>
          <Text style={{color: colors.defaultWhite}}>+ {time}</Text>
        </View>
      </TouchableWithoutFeedback>
      <Text style={{color: colors.defaultWhite}}>{props.unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: colors.mainBackgroundColor,
  },
  container: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerArc: {
    position: 'absolute',
    backgroundColor: colors.innerArcBackgroundColor,
    height: 160,
    width: 160,
    borderRadius: 80,
  },
  absolute: {
    position: 'absolute',
  },
  timeText: {
    fontSize: 28,
  },
  timePicker: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  timePickerButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerButton: {
    height: 32,
    width: 64,
    borderRadius: 16,
    borderColor: colors.primary,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
    height: 10,
    flexDirection: 'row',
    paddingTop: 20,
  },
  roundedButton: {
    height: 64,
    width: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default MainScreen;
