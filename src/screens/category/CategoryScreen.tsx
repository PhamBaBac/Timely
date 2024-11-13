// import React, {useState, useEffect, useRef} from 'react';
// import auth from '@react-native-firebase/auth';
// import {
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   Animated,
//   Modal,
//   TextInput,
//   Switch,
// } from 'react-native';
// import {Container} from '../../components';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {appColors} from '../../constants';
// import firestore from '@react-native-firebase/firestore';

// // Define TypeScript interfaces for better type safety
// interface Category {
//   id: string;
//   name: string;
//   count: number;
//   color: string;
//   icon: string;
//   createdAt: number;
//   updatedAt: number;
//   uid?: string;
// }

// // interface CategoryWithoutCount extends Omit<Category, 'count'> {}

// const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'count'>[] = [
//   {
//     name: 'Cá nhân',
//     color: 'default',
//     icon: '',
//     createdAt: Date.now(),
//     updatedAt: Date.now(),
//   },
//   {
//     name: 'Gia đình',
//     color: 'default',
//     icon: '',
//     createdAt: Date.now(),
//     updatedAt: Date.now(),
//   },
// ];

// const EMPTY_CATEGORY: CategoryWithoutCount = {
//   id: '',
//   name: '',
//   color: 'default',
//   icon: '',
//   createdAt: 0,
//   updatedAt: 0,
// };

// // const CategoryScreen: React.FC = () => {
// //   const [categories, setCategories] = useState<Category[]>([]);
// //   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
// //     null,
// //   );
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [modalPosition, setModalPosition] = useState({top: 0, right: 0});
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const [editModalVisible, setEditModalVisible] = useState(false);
// //   const [editingCategory, setEditingCategory] =
// //     useState<CategoryWithoutCount>(EMPTY_CATEGORY);
// //   const [isDefaultColor, setIsDefaultColor] = useState(true);
// //   const [isCreating, setIsCreating] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);

// //   const user = auth().currentUser;

// //   useEffect(() => {
// //     if (!user?.uid) {
// //       Alert.alert('Lỗi', 'Vui lòng đăng nhập để tiếp tục');
// //       return;
// //     }

// //     const setupCategories = async () => {
// //       try {
// //         // Add default categories if they don't exist
// //         const batch = firestore().batch();
// //         const categoriesRef = firestore().collection('categories');

// //         for (const defaultCategory of DEFAULT_CATEGORIES) {
// //           const categorySnapshot = await categoriesRef
// //             .where('name', '==', defaultCategory.name)
// //             .where('uid', '==', user.uid)
// //             .get();

// //           if (categorySnapshot.empty) {
// //             const newCategoryRef = categoriesRef.doc();
// //             batch.set(newCategoryRef, {
// //               ...defaultCategory,
// //               uid: user.uid,
// //             });
// //           }
// //         }

// //         await batch.commit();
// //       } catch (error) {
// //         console.error('Error setting up default categories:', error);
// //       }
// //     };

// //     setupCategories();

// //     // Listen for category changes
// //     const unsubscribe = firestore()
// //       .collection('categories')
// //       .where('uid', '==', user.uid)
// //       .onSnapshot(async snapshot => {
// //         try {
// //           const categoriesList = await Promise.all(
// //             snapshot.docs.map(async doc => {
// //               const categoryData = doc.data();
// //               const tasksSnapshot = await firestore()
// //                 .collection('tasks')
// //                 .where('category', '==', categoryData.name)
// //                 .where('uid', '==', user.uid)
// //                 .get();

// //               return {
// //                 id: doc.id,
// //                 name: categoryData.name,
// //                 count: tasksSnapshot.size,
// //                 color: categoryData.color || 'default',
// //                 icon: categoryData.icon || '',
// //                 createdAt: categoryData.createdAt || Date.now(),
// //                 updatedAt: categoryData.updatedAt || Date.now(),
// //               };
// //             }),
// //           );
// //           setCategories(categoriesList);
// //         } catch (error) {
// //           console.error('Error fetching categories:', error);
// //           Alert.alert('Lỗi', 'Không thể tải danh sách loại công việc');
// //         }
// //       });

// //     return () => unsubscribe();
// //   }, [user?.uid]);

//   const handleEdit = (category: Category) => {
//     setEditingCategory(category);
//     setIsDefaultColor(category.color === 'default');
//     setIsCreating(false);
//     setEditModalVisible(true);
//     hideModal();
//   };

//   const handleCreate = () => {
//     setEditingCategory(EMPTY_CATEGORY);
//     setIsDefaultColor(true);
//     setIsCreating(true);
//     setEditModalVisible(true);
//   };

//   const handleDelete = async (category: Category) => {
//     if (!user?.uid) return;

// //     // Check if category has tasks
// //     const tasksSnapshot = await firestore()
// //       .collection('tasks')
// //       .where('category', '==', category.name)
// //       .where('uid', '==', user.uid)
// //       .get();

// //     if (!tasksSnapshot.empty) {
// //       Alert.alert(
// //         'Không thể xóa',
// //         'Loại công việc này đang có công việc. Vui lòng xóa hoặc di chuyển các công việc trước.',
// //       );
// //       return;
// //     }

//     Alert.alert(
//       'Xóa Loại Công Việc',
//       `Bạn có chắc chắn muốn xóa loại công việc: ${category.name}?`,
//       [
//         {text: 'Hủy', style: 'cancel'},
//         {
//           text: 'Xóa',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               setIsLoading(true);
//               await firestore()
//                 .collection('categories')
//                 .doc(category.id)
//                 .delete();
//               Alert.alert('Thành công', 'Đã xóa loại công việc thành công');
//               hideModal();
//             } catch (error) {
//               console.error('Error deleting category:', error);
//               Alert.alert(
//                 'Lỗi',
//                 'Không thể xóa loại công việc. Vui lòng thử lại sau.',
//               );
//             } finally {
//               setIsLoading(false);
//             }
//           },
//         },
//       ],
//     );
//   };

// //   const showModal = (category: Category, event: any) => {
// //     const {pageY, pageX} = event.nativeEvent;
// //     setModalPosition({top: pageY, right: pageX});
// //     setSelectedCategory(category);
// //     setModalVisible(true);
// //     Animated.timing(fadeAnim, {
// //       toValue: 1,
// //       duration: 200,
// //       useNativeDriver: true,
// //     }).start();
// //   };

//   const hideModal = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => setModalVisible(false));
//   };

//   const saveCategory = async () => {
//     if (!user?.uid) return;
//     if (!editingCategory.name.trim()) {
//       Alert.alert('Lỗi', 'Vui lòng nhập tên loại công việc');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const categoryData = {
//         name: editingCategory.name.trim(),
//         color: isDefaultColor ? 'default' : editingCategory.color,
//         uid: user.uid,
//         updatedAt: Date.now(),
//       };

//       if (isCreating) {
//         // Check for duplicate names
//         const existingCategory = await firestore()
//           .collection('categories')
//           .where('name', '==', categoryData.name)
//           .where('uid', '==', user.uid)
//           .get();

// //         if (!existingCategory.empty) {
// //           Alert.alert('Lỗi', 'Tên loại công việc đã tồn tại');
// //           return;
// //         }

// //         await firestore()
// //           .collection('categories')
// //           .add({
// //             ...categoryData,
// //             createdAt: Date.now(),
// //           });
// //         Alert.alert('Thành công', 'Đã tạo loại công việc mới thành công');
// //       } else {
// //         await firestore()
// //           .collection('categories')
// //           .doc(editingCategory.id)
// //           .update(categoryData);
// //         Alert.alert('Thành công', 'Đã cập nhật loại công việc thành công');
// //       }
// //       setEditModalVisible(false);
// //     } catch (error) {
// //       console.error('Error saving category:', error);
// //       Alert.alert(
// //         'Lỗi',
// //         `Không thể ${
// //           isCreating ? 'tạo' : 'cập nhật'
// //         } loại công việc. Vui lòng thử lại sau.`,
// //       );
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <Container back title="Quản lý loại công việc">
// //       <StatusBar barStyle="dark-content" backgroundColor={appColors.white} />
// //       <ScrollView style={styles.container}>
// //         {categories.map(category => (
// //           <View key={category.id} style={styles.categoryItem}>
// //             <View style={styles.categoryLeft}>
// //               <Icon
// //                 name="radio-button-checked"
// //                 size={24}
// //                 color={
// //                   category.color === 'default'
// //                     ? appColors.primary
// //                     : category.color
// //                 }
// //               />
// //               <Text style={styles.categoryName}>{category.name}</Text>
// //             </View>
// //             <View style={styles.categoryRight}>
// //               <Text style={styles.categoryCount}>{category.count}</Text>
// //               <TouchableOpacity
// //                 onPress={event => showModal(category, event)}
// //                 disabled={isLoading}>
// //                 <Icon name="more-vert" size={24} color={appColors.gray} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         ))}
// //         <TouchableOpacity
// //           style={styles.addButton}
// //           onPress={handleCreate}
// //           disabled={isLoading}>
// //           <Icon name="add" size={24} color={appColors.primary} />
// //           <Text style={styles.addButtonText}>Tạo mới</Text>
// //         </TouchableOpacity>
// //       </ScrollView>

// //       {modalVisible && (
// //         <Animated.View
// //           style={[
// //             styles.modalContainer,
// //             {
// //               top: modalPosition.top - 40,
// //               right: 20,
// //               opacity: fadeAnim,
// //             },
// //           ]}>
// //           <TouchableOpacity
// //             style={styles.modalButton}
// //             onPress={() => selectedCategory && handleEdit(selectedCategory)}
// //             disabled={isLoading}>
// //             <Text style={styles.modalButtonText}>Chỉnh sửa</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={styles.modalButton}
// //             onPress={() => selectedCategory && handleDelete(selectedCategory)}
// //             disabled={isLoading}>
// //             <Text style={styles.modalButtonText}>Xóa</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={styles.modalButton}
// //             onPress={hideModal}
// //             disabled={isLoading}>
// //             <Text style={styles.modalButtonText}>Hủy</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       )}

// //       <Modal
// //         visible={editModalVisible}
// //         transparent={true}
// //         animationType="fade"
// //         onRequestClose={() => !isLoading && setEditModalVisible(false)}>
// //         <View style={styles.editModalOverlay}>
// //           <View style={styles.editModalContent}>
// //             <Text style={styles.editModalTitle}>
// //               {isCreating
// //                 ? 'Tạo loại công việc mới'
// //                 : 'Chỉnh sửa loại công việc'}
// //             </Text>
// //             <TextInput
// //               style={styles.input}
// //               value={editingCategory.name}
// //               onChangeText={text =>
// //                 setEditingCategory({...editingCategory, name: text})
// //               }
// //               placeholder="Tên loại công việc"
// //               maxLength={50}
// //               editable={!isLoading}
// //             />
// //             <Text style={styles.editModalSubtitle}>
// //               {editingCategory.name.length}/50
// //             </Text>
// //             <View style={styles.editModalButtons}>
// //               <TouchableOpacity
// //                 onPress={() => setEditModalVisible(false)}
// //                 disabled={isLoading}>
// //                 <Text
// //                   style={[
// //                     styles.cancelButton,
// //                     isLoading && styles.disabledButton,
// //                   ]}>
// //                   HỦY
// //                 </Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity onPress={saveCategory} disabled={isLoading}>
// //                 <Text
// //                   style={[
// //                     styles.saveButton,
// //                     isLoading && styles.disabledButton,
// //                   ]}>
// //                   {isLoading ? 'ĐANG LƯU...' : 'LƯU'}
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </Container>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: appColors.white,
// //   },
// //   categoryItem: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingVertical: 12,
// //     paddingHorizontal: 16,
// //   },
// //   categoryLeft: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   categoryName: {
// //     marginLeft: 16,
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   categoryRight: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   categoryCount: {
// //     marginRight: 16,
// //     fontSize: 16,
// //     color: appColors.gray,
// //   },
// //   addButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 16,
// //   },
// //   addButtonText: {
// //     marginLeft: 16,
// //     fontSize: 16,
// //     color: appColors.primary,
// //   },
// //   modalContainer: {
// //     position: 'absolute',
// //     backgroundColor: 'white',
// //     borderRadius: 5,
// //     padding: 10,
// //     elevation: 5,
// //     shadowColor: '#000',
// //     shadowOffset: {width: 0, height: 2},
// //     shadowOpacity: 0.25,
// //     shadowRadius: 3,
// //   },
// //   modalButton: {
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //   },
// //   modalButtonText: {
// //     fontSize: 14,
// //     color: appColors.primary,
// //   },
// //   editModalOverlay: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //   },
// //   editModalContent: {
// //     backgroundColor: 'white',
// //     borderRadius: 10,
// //     padding: 20,
// //     width: '80%',
// //   },
// //   editModalTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     marginBottom: 15,
// //   },
// //   input: {
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#ccc',
// //     paddingVertical: 8,
// //     marginBottom: 5,
// //   },
// //   editModalSubtitle: {
// //     fontSize: 12,
// //     color: '#888',
// //     alignSelf: 'flex-end',
// //     marginBottom: 15,
// //   },
// //   colorOption: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   colorSwitch: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   editModalButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'flex-end',
// //   },
// //   cancelButton: {
// //     color: appColors.primary,
// //     marginRight: 20,
// //   },
// //   saveButton: {
// //     color: appColors.primary,
// //     fontWeight: 'bold',
// //   },
// //   disabledButton: {
// //     opacity: 0.5,
// //   },
// // });

// // export default CategoryScreen;
// import { View, Text } from 'react-native'
// import React from 'react'
// import { Container } from '../../components'

// const CategoryScreen = () => {
//   return (
//     <Container back title="Quản lý loại công việc">
//       <StatusBar barStyle="dark-content" backgroundColor={appColors.white} />
//       <ScrollView style={styles.container}>
//         {categories.map(category => (
//           <View key={category.id} style={styles.categoryItem}>
//             <View style={styles.categoryLeft}>
//               <Icon
//                 name="radio-button-checked"
//                 size={24}
//                 color={
//                   category.color === 'default'
//                     ? appColors.primary
//                     : category.color
//                 }
//               />
//               <Text style={styles.categoryName}>{category.name}</Text>
//             </View>
//             <View style={styles.categoryRight}>
//               <Text style={styles.categoryCount}>{category.count}</Text>
//               <TouchableOpacity
//                 onPress={event => showModal(category, event)}
//                 disabled={isLoading}>
//                 <Icon name="more-vert" size={24} color={appColors.gray} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))}
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={handleCreate}
//           disabled={isLoading}>
//           <Icon name="add" size={24} color={appColors.primary} />
//           <Text style={styles.addButtonText}>Tạo mới</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {modalVisible && (
//         <Animated.View
//           style={[
//             styles.modalContainer,
//             {
//               top: modalPosition.top - 40,
//               right: 20,
//               opacity: fadeAnim,
//             },
//           ]}>
//           <TouchableOpacity
//             style={styles.modalButton}
//             onPress={() => selectedCategory && handleEdit(selectedCategory)}
//             disabled={isLoading}>
//             <Text style={styles.modalButtonText}>Chỉnh sửa</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.modalButton}
//             onPress={() => selectedCategory && handleDelete(selectedCategory)}
//             disabled={isLoading}>
//             <Text style={styles.modalButtonText}>Xóa</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.modalButton}
//             onPress={hideModal}
//             disabled={isLoading}>
//             <Text style={styles.modalButtonText}>Hủy</Text>
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       <Modal
//         visible={editModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => !isLoading && setEditModalVisible(false)}>
//         <View style={styles.editModalOverlay}>
//           <View style={styles.editModalContent}>
//             <Text style={styles.editModalTitle}>
//               {isCreating
//                 ? 'Tạo loại công việc mới'
//                 : 'Chỉnh sửa loại công việc'}
//             </Text>
//             <TextInput
//               style={styles.input}
//               value={editingCategory.name}
//               onChangeText={text =>
//                 setEditingCategory({...editingCategory, name: text})
//               }
//               placeholder="Tên loại công việc"
//               maxLength={50}
//               editable={!isLoading}
//             />
//             <Text style={styles.editModalSubtitle}>
//               {editingCategory.name.length}/50
//             </Text>
//             <View style={styles.editModalButtons}>
//               <TouchableOpacity
//                 onPress={() => setEditModalVisible(false)}
//                 disabled={isLoading}>
//                 <Text
//                   style={[
//                     styles.cancelButton,
//                     isLoading && styles.disabledButton,
//                   ]}>
//                   HỦY
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={saveCategory} disabled={isLoading}>
//                 <Text
//                   style={[
//                     styles.saveButton,
//                     isLoading && styles.disabledButton,
//                   ]}>
//                   {isLoading ? 'ĐANG LƯU...' : 'LƯU'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </Container>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: appColors.white,
//   },
//   categoryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   categoryLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   categoryName: {
//     marginLeft: 16,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   categoryRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   categoryCount: {
//     marginRight: 16,
//     fontSize: 16,
//     color: appColors.gray,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   addButtonText: {
//     marginLeft: 16,
//     fontSize: 16,
//     color: appColors.primary,
//   },
//   modalContainer: {
//     position: 'absolute',
//     backgroundColor: 'white',
//     borderRadius: 5,
//     padding: 10,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//   },
//   modalButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   modalButtonText: {
//     fontSize: 14,
//     color: appColors.primary,
//   },
//   editModalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   editModalContent: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     width: '80%',
//   },
//   editModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingVertical: 8,
//     marginBottom: 5,
//   },
//   editModalSubtitle: {
//     fontSize: 12,
//     color: '#888',
//     alignSelf: 'flex-end',
//     marginBottom: 15,
//   },
//   colorOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   colorSwitch: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   editModalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   cancelButton: {
//     color: appColors.primary,
//     marginRight: 20,
//   },
//   saveButton: {
//     color: appColors.primary,
//     fontWeight: 'bold',
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
// });

// export default CategoryScreen;
import {View, Text} from 'react-native';
import React from 'react';
import {Container} from '../../components';

const CategoryScreen = () => {
  return (
    <Container back>
      <Text>CategoryScreen</Text>
    </Container>
  );
};

export default CategoryScreen;
