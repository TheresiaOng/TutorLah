import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentPopup({
  onPay,
  onCancel,
}: {
  onPay: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.popupContainer}>
      <Text style={styles.title}>Weekly Tutoring Session</Text>
      <View style={styles.separator} />

      <View style={styles.row}>
        <Image
          source={require("../assets/images/hatLogo.png")}
          style={styles.avatar}
        />
        <Text style={styles.label}>Paid To</Text>
        <Text style={styles.name}>Full Name</Text>
      </View>

      <View style={styles.row}>
        <Image
          source={require("../assets/images/hatLogo.png")}
          style={styles.avatar}
        />
        <Text style={styles.label}>Paid By</Text>
        <Text style={styles.name}>Full Name</Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.sectionLabel}>Details</Text>

      <View style={styles.detailRow}>
        <Image
          source={require("../assets/images/calendar.png")}
          style={styles.avatar}
        />
        <Text style={styles.detailText}>Tuesday [6pm - 8pm] - MATH</Text>
        <Text style={styles.detailText}>Friday [6pm - 8pm] - PHYSICS</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.icon}>💲</Text>
        <Text style={styles.detailText}>S$65/hr</Text>
      </View>

      <View style={styles.totalRow}>
        <View style={styles.yellowLine} />
        <Text style={styles.totalText}>Total S$260/week</Text>
        <View style={styles.yellowLine} />
      </View>

      <TouchableOpacity style={styles.payButton} onPress={onPay}>
        <Text style={styles.payButtonText}>Pay S$260</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    backgroundColor: "#FEEFCB",
    padding: 20,
    borderRadius: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#803300",
    textAlign: "center",
    marginBottom: 10,
  },
  separator: {
    borderBottomWidth: 2,
    borderColor: "#FFD247",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 10,
  },
  label: {
    fontWeight: "bold",
    color: "#803300",
    marginRight: 10,
  },
  name: {
    color: "#803300",
    fontSize: 16,
  },
  sectionLabel: {
    fontWeight: "bold",
    color: "#803300",
    fontSize: 16,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  icon: {
    fontSize: 22,
    marginRight: 8,
  },
  detailText: {
    fontSize: 15,
    color: "#803300",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    justifyContent: "space-between",
  },
  yellowLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#FFD247",
  },
  totalText: {
    marginHorizontal: 8,
    fontWeight: "bold",
    color: "#803300",
  },
  payButton: {
    backgroundColor: "#28C740",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  payButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#F07C5B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 18,
    color: "#803300",
    fontWeight: "bold",
  },
});
