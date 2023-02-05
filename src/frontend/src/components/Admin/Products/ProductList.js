import React, { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ImageUpload from "./ImageUpload";
import { v4 as uuidv4 } from "uuid";
import {
  deleteProductById,
  restoreProductById,
  handleGetCategoryById,
  handleGetAllCategory,
} from "../../../services/productService";
import { cloudinaryUpload } from "../../../services/userService";
import Multiselect from "multiselect-react-dropdown";
import { connect } from "react-redux";
import * as actions from "../../../store/actions";
import adminService from "../../../services/adminService";
import Axios from "axios";
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [], // lưu props của ảnh
      showEdit: false, // hiện ẩn modal edit
      showDelete: false, // hiện ẩn modal edit
      details: { ...this.props.info }, // lưu các props của 1 sản phẩm
      listCategory: null,
      category: null,
    };
  }

  async componentDidMount() {
    let data = await handleGetCategoryById(this.state.details.pid);
    //console.log(data.category)
    this.setState({
      listCategory: data.category,
    });
    data = await handleGetAllCategory();
    console.log(data);
    this.setState({
      category: data,
    });
  }

  componentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    this.state.files.forEach((file) => URL.revokeObjectURL(file.preview));
  }

  addFile = (file) => {
    console.log(file);
    this.setState({
      files: file.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    });
  };

  handleCloseEdit = () => this.setState({ showEdit: false });
  handleOpenEdit = () => this.setState({ showEdit: true });

  handleCloseDelete = () => this.setState({ showDelete: false });
  handleOpenDelete = () => this.setState({ showDelete: true });

  deleteProducts = (id) => {
    this.handleOpenDelete();
    //console.log(id)
  };

  restoreProducts = async (id) => {
    await restoreProductById(id);
    this.reRenderList();
  };

  editProducts = (id) => {
    this.handleOpenEdit();
    console.log(id);
  };

  onPreviewDrop = (files) => {
    this.setState({
      files: this.state.files.concat(files),
    });
  };

  handleClickBack = () => {
    this.setState({ details: {} });
    this.handleCloseEdit();
  };

  handleClickUpdate = async () => {
    let product = {
      ...this.state.details,
      discount: Number.parseInt(this.state.details.discount),
      price: Number.parseFloat(this.state.details.price),
      quantity: Number.parseInt(this.state.details.quantity),
      category: this.state.listCategory,
    };
    await adminService.handleUpdateProductByStore(product);
    this.reRenderList();
    this.handleCloseEdit();
  };

  handleClickCancel = () => {
    this.handleCloseDelete();
  };

  handleClickDelete = async () => {
    //console.log(this.props.info)
    await deleteProductById(this.props.info.pid);
    this.reRenderList();
    this.handleCloseDelete();
  };

  //Render lai cac san pham sau khi sua xoa
  reRenderList = () => {
    this.props.updateChange(this.props.sid);
  };

  onChangeInputImage = async (e) => {
    const cloudinaryEnv = {
      cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      upload_preset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
    };
    let formData = new FormData();
    formData.append("file", e.target.files[0], "file");
    formData.append("upload_preset", cloudinaryEnv.upload_preset);

    Axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryEnv.cloud_name}/image/upload`,
      formData
    ).then((res) => {
      this.setState({
        details: {
          ...this.state.details,
          img: res.data.secure_url,
        },
      });
    });

    //console.log('Link',tmp)
    this.setState({
      details: {
        ...this.state.details,
        img: tmp.secure_url,
      },
    });
  };

  render() {
    let admin = this.props.adminInfo;
    const {
      pid: id,
      img: url,
      title: name,
      price,
      quantity,
      unit,
      content,
      discount,
      status,
    } = this.props.info;
    let categoryString = "";
    if (this.state.listCategory) {
      this.state.listCategory.forEach((item) => {
        categoryString += item.title + ", ";
      });
    }
    categoryString = categoryString.slice(0, categoryString.length - 2);
    const categoryArray = this.state.listCategory;
    console.log(categoryArray);

    return (
      <>
        <tbody>
          <tr>
            <td>
              <img src={url} alt={name} />
            </td>
            <td>{name}</td>
            <td>{categoryString}</td>
            <td>{admin.storeName}</td>
            <td>${price}</td>
            <td>{quantity}</td>
            <td>
              <span 
                className={status === "active" ? "active-bg" : "deleted-bg"}
              >{status}</span>
            </td>
            <td>
              {status === "active" ? (
                <i
                className="far fa-trash-alt"
                onClick={() => this.deleteProducts(id)}
              ></i>) : (
                <i
                className="fa fa-recycle"
                onClick={() => this.restoreProducts(id)}
              ></i>
              )}
              <i
                className="far fa-edit"
                onClick={() => this.editProducts(id)}
              ></i>
            </td>
          </tr>
        </tbody>

        {/* Modal xử lí phần edit */}
        <Modal
          show={this.state.showEdit}
          onHide={this.handleCloseEdit}
          backdrop="static"
          keyboard={false}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              Edit Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="upload-img-container">
              <div className="profile__infor-avatar">
                <label htmlFor="avatar" className="profile__infor-avatar-title">
                  <i className="fas fa-cloud-upload-alt avatar_upload-icon"></i>
                  <br />
                  <span className="avatar-title-bold">UpLoad an image</span>
                  &nbsp; or drag and drop
                  <br></br>
                  <span>PNG, JPG</span>
                </label>

                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/png, image/jpeg"
                  className="profile__infor-avatar-input"
                  onChange={(e) => this.onChangeInputImage(e)}
                />
              </div>
              <div className="avatar-img">
                <img
                  src={this.state.details.img}
                  alt=""
                  width="100"
                  height="100"
                />
              </div>
            </div>
            <div className="gr-cate">
              <div className="form-gr">
              <Form.Group>
                  {this.state.category && (
                      <>
                      <Form.Label>Category</Form.Label>
                      <Multiselect
                        options={this.state?.category} // Options to display in the dropdown
                        selectedValues={categoryArray} // Preselected value to persist in dropdown
                        onSelect={this.onSelect} // Function will trigger on select event
                        onRemove={this.onRemove} // Function will trigger on remove event
                        displayValue="title" // Property name to display in the dropdown options
                        placeholder="Select product category"
                      />
                    </>
                  )}
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={name}
                    onChange={(e) =>
                      this.setState({
                        details: {
                          ...this.state.details,
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={unit}
                    onChange={(e) =>
                      this.setState({
                        details: {
                          ...this.state.details,
                          unit: e.target.value,
                        },
                      })
                    }
                  />
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    defaultValue={content}
                    className="description"
                    onChange={(e) =>
                      this.setState({
                        details: {
                          ...this.state.details,
                          content: e.target.value,
                        },
                      })
                    }
                  />
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={price}
                    onChange={(e) =>
                      this.setState({
                        details: {
                          ...this.state.details,
                          price: e.target.value,
                        },
                      })
                    }
                  />
                  <Form.Label>Sale Price</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={discount}
                    onChange={(e) =>
                      this.setState({
                        details: {  
                          ...this.state.details,
                          discount: e.target.value,
                        },
                      })
                    }
                  />
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={quantity}
                    onChange={(e) =>
                      this.setState({
                        details: {
                          ...this.state.details,
                          quantity: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary btn-back" onClick={this.handleClickBack}>
              Back
            </Button>
            <Button variant="success" onClick={this.handleClickUpdate}>
              Update Products
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal xử lí phần delete */}
        <Modal
          show={this.state.showDelete}
          onHide={this.handleCloseDelete}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          dialogClassName="modal-delete"
        >
          <Modal.Body className="modal-body-delete">
            <i className="far fa-trash-alt"></i>
            <h3>Delete {this.props.info["title"]}</h3>
            <p>Are you sure, you want to delete?</p>
            <div className="modal-btn-delete">
              <Button variant="success" onClick={this.handleClickCancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={this.handleClickDelete}>
                Delete
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    started: state.app.started,
    isLoggedIn: state.admin.isLoggedIn,
    adminInfo: state.admin.adminInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeAppMode: (payload) => dispatch(actions.changeAppMode(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);
