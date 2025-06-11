import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaymentCreation() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Payment Details</Text>

      <LabelledInput label="Paid To:" />
      <LabelledInput label="Paid By:" />
      <LabelledInput label="Subject:" />
      <LabelledInput label="Date of Lesson:" />

      <Text style={styles.label}>Timing:</Text>
      <View style={styles.timingRow}>
        <TextInput style={styles.timingBox} />
        <Text style={styles.dash}>-</Text>
        <TextInput style={styles.timingBox} />
      </View>

      <Text style={styles.label}>Cost/hr:</Text>
      <TextInput style={styles.input} placeholder="S$" placeholderTextColor="#0077aa" />

      <Text style={styles.label}>Total cost:</Text>
      <TextInput style={styles.input} placeholder="S$" placeholderTextColor="#0077aa" />

      <TouchableOpacity style={styles.postButton}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const LabelledInput = ({ label }: { label: string }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} />
  </>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2D6FA2',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 6,
    color: '#153A7D',
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timingBox: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
  },
  dash: {
    marginHorizontal: 10,
    fontSize: 18,
    color: '#2D6FA2',
  },
  postButton: {
    marginTop: 65,
    backgroundColor: '#4DA8FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#153A7D',
  },
});