import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { ProductService, ProductModel } from '../../product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-panel',
  imports: [RouterModule, FormsModule, CurrencyPipe, CommonModule],
  templateUrl: './panel.html',
  styleUrls: ['./panel.css']
})
export class Panel implements OnInit {
  products: ProductModel[] = [];
  isLoading = true;
  error: string | null = null;
  editIndex: number | null = null;
  editedProduct: Partial<ProductModel> = {};
  showAddForm = false;
  newProduct: Partial<ProductModel> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: ''
  };
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (response: {allOK: boolean, message: string, data: ProductModel[]}) => {
        if (response.allOK) {
          this.products = response.data;
          this.toastr.success('Productos cargados correctamente');
        } else {
          this.error = response.message;
          this.toastr.error(response.message);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los productos.';
        this.toastr.error('Error al cargar los productos');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido.';
        this.toastr.error('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      // Validar tamaño de archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'El archivo es demasiado grande. Máximo 5MB.';
        this.toastr.error('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      this.selectedFile = file;
      this.error = null;
    }
  }

  uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No hay archivo seleccionado');
        return;
      }

      this.isUploading = true;
      this.productService.uploadImage(this.selectedFile).subscribe({
        next: (response: {allOK: boolean, message: string, data: {imageUrl: string, filename: string}}) => {
          this.isUploading = false;
          if (response.allOK) {
            resolve(response.data.imageUrl);
          } else {
            reject(response.message);
          }
        },
        error: (err: any) => {
          this.isUploading = false;
          reject('Error al subir la imagen');
        }
      });
    });
  }

  async addProduct() {
    if (!this.newProduct.name || !this.newProduct.description || !this.newProduct.category || this.newProduct.price === undefined) {
      this.error = 'Todos los campos son requeridos: nombre, descripción, categoría y precio';
      this.toastr.error('Todos los campos son requeridos');
      return;
    }
    
    try {
      let imageUrl = '';
      if (this.selectedFile) {
        imageUrl = await this.uploadImage();
      }
      
      const productData = {
        ...this.newProduct,
        imageUrl: imageUrl
      } as Omit<ProductModel, '_id' | 'createdAt' | 'updatedAt'>;
      
      this.productService.createProduct(productData).subscribe({
        next: (response: {allOK: boolean, message: string, data: ProductModel}) => {
          if (response.allOK) {
            this.products.push(response.data);
            this.showAddForm = false;
            this.resetForm();
            this.error = null;
            this.toastr.success('Producto agregado correctamente');
          } else {
            this.error = response.message;
            this.toastr.error(response.message);
          }
        },
        error: (err: any) => {
          this.error = 'Error al agregar el producto.';
          this.toastr.error('Error al agregar el producto');
          console.error('Error:', err);
        }
      });
    } catch (error) {
      this.error = error as string;
      this.toastr.error(error as string);
    }
  }

  resetForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: ''
    };
    this.selectedFile = null;
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editedProduct = { ...this.products[index] };
  }

  cancelEdit() {
    this.editIndex = null;
    this.editedProduct = {};
  }

  saveEdit(product: ProductModel) {
    if (!this.editedProduct.price || this.editedProduct.stock === undefined) return;
    
    this.productService.updateProduct(product._id, {
      price: this.editedProduct.price,
      stock: this.editedProduct.stock
    }).subscribe({
      next: (response: {allOK: boolean, message: string, data: ProductModel}) => {
        if (response.allOK) {
          this.products[this.editIndex!] = { ...product, ...response.data };
          this.cancelEdit();
          this.toastr.success('Producto actualizado correctamente');
        } else {
          this.error = response.message;
          this.toastr.error(response.message);
        }
      },
      error: (err: any) => {
        this.error = 'Error al guardar los cambios.';
        this.toastr.error('Error al guardar los cambios');
      }
    });
  }

  async updateProductImage(product: ProductModel, file: File): Promise<void> {
    try {
      this.isUploading = true;
      this.productService.uploadProductImage(file, product._id).subscribe({
        next: (response: {allOK: boolean, message: string, data: {imageUrl: string, filename: string}}) => {
          this.isUploading = false;
          if (response.allOK) {
            // Actualizar el producto con la nueva URL de imagen
            this.productService.updateProduct(product._id, { imageUrl: response.data.imageUrl }).subscribe({
              next: (updateResponse: {allOK: boolean, message: string, data: ProductModel}) => {
                if (updateResponse.allOK) {
                  const index = this.products.findIndex(p => p._id === product._id);
                  if (index !== -1) {
                    this.products[index] = { ...this.products[index], imageUrl: response.data.imageUrl };
                  }
                  this.toastr.success('Imagen actualizada correctamente');
                }
              }
            });
          } else {
            this.error = response.message;
            this.toastr.error(response.message);
          }
        },
        error: (err: any) => {
          this.isUploading = false;
          this.error = 'Error al actualizar la imagen del producto.';
          this.toastr.error('Error al actualizar la imagen del producto');
        }
      });
    } catch (error) {
      this.isUploading = false;
      this.error = error as string;
      this.toastr.error(error as string);
    }
  }

  deleteProduct(product: ProductModel, index: number) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    
    this.productService.deleteProduct(product._id).subscribe({
      next: (response: {allOK: boolean, message: string, data: void}) => {
        if (response.allOK) {
          this.products.splice(index, 1);
          this.toastr.success('Producto eliminado correctamente');
        } else {
          this.error = response.message;
          this.toastr.error(response.message);
        }
      },
      error: (err: any) => {
        this.error = 'Error al eliminar el producto.';
        this.toastr.error('Error al eliminar el producto');
      }
    });
  }

  onProductImageSelected(event: any, product: ProductModel): void {
    const file = event.target.files?.[0];
    if (file) {
      this.updateProductImage(product, file);
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  getPriceClass(price: number): string {
    if (price <= 50000) return 'price-low';
    if (price <= 100000) return 'price-medium';
    return 'price-high';
  }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'stock-low';
    if (stock <= 15) return 'stock-medium';
    return 'stock-high';
  }
}
  