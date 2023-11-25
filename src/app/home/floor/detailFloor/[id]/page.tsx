"use client";
import { futuna } from "../../../../../../public/fonts/futura";
import React, { ChangeEvent, useCallback, useState } from "react";
import styles from "./detailFloor.module.scss";
import mainStyles from "../../../page.module.css";
import utilStyles from "@/styles/utils.module.scss";
import buildingStyles from "../../floor.module.scss";
import Form from "react-bootstrap/Form";
import clsx from "clsx";
import ButtonComponent from "@/components/buttonComponent/buttonComponent";
import Image from "next/image";
import ToastComponent from "@/components/ToastComponent/ToastComponent";
import axios from "axios";
import { Floor } from "@/models/floor";
import { useQuery } from "react-query";
import toastMessage from "@/utils/toast";
import { loadingFiler, removeLoadingFilter } from "@/libs/utils";
import { ToastContainer } from "react-toastify";
import { Button, Modal, Table } from "react-bootstrap";
import {
  AddResidentIcon,
  CloseIcon,
  DetailIcon,
  EditIcon,
} from "@/components/icons";
import ModalComponent from "@/components/Modal/Modal";
import { format } from "date-fns";
import { Manager } from "@/models/manager";
import { Apartment } from "@/models/apartment";
const DetailFloor = ({ params }: { params: { id: string } }) => {
  // init modal add manager
  const [showModalApartment, setShowModalApartment] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [listChecked, setListChecked] = useState<String[]>([]);
  const [floor, setFloor] = useState<Floor>();
  const [apartment, setApartment] = useState<Array<Apartment>>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const retrieveFloor = async () => {
    try {
      loadingFiler(document.body!);
      const res = await axios.get(`/api/floor/${params.id}`);
      removeLoadingFilter(document.body!);
      const floorData = res.data as Floor;
      console.log(floorData);
      setFloor(floorData);
      return res.data;
    } catch (error) {
      removeLoadingFilter(document.body!);
      console.log(error);
    }
  };
  //handle check
  const handleCheckAll = () => {
    setCheckAll(!checkAll);
    let newList: String[];
    if (!checkAll) newList = apartment.map((item) => item.apartment_id);
    else newList = [];
    setListChecked(newList);
  };
  const handleCheck = (id: string) => {
    const isCheck = listChecked?.includes(id);
    let newList: String[];
    if (isCheck) {
      newList = listChecked?.filter((item) => item !== id);
    } else newList = [...listChecked, id];
    if (newList.length === apartment.length) {
      setCheckAll(true);
    } else setCheckAll(false);
    setListChecked(newList);
  };
  const titleTable = ["ID", "Tên", "Số điện thoại", "Email", "Ngày tạo"];
  const deleleHandle = (id: string) => {
    setSelectedId(id);
    setShowModal(true);
  };
  const handleConfirmDelete = async (id: string) => {
    console.log(id);
    setShowModal(false);
    try {
      await axios.post(`/api/floor/${params.id}/deleteApartment`, undefined, {
        params: {
          apartmentId: id,
        },
      });
      toastMessage({ type: "success", title: "Delete successfully!" });
      refetch();
    } catch (err) {
      toastMessage({ type: "errpr", title: "Delete faily!" });
      console.log(err);
    }
  };
  const handleSave = async () => {
    try {
      const res = await axios.post(
        `/api/floor/${params.id}/addApartment`,
        undefined,
        {
          params: {
            apartmentId: listChecked,
          },
          paramsSerializer: {
            indexes: null,
          },
        }
      );
      const updatedBuilding = res.data;
      if (updatedBuilding.managers) {
      }
      refetch();
      setListChecked([]);
    } catch (e: any) {
      throw new Error(e.message);
    }
    setShowModalApartment(false);
  };
  const handleShowManagerModal = async () => {
    const res = await axios.get("/api/apartment/")
    const data: Apartment[] = res.data;
    const newData = data.filter((item) => item.floorId === null);
    setApartment(newData);
    setShowModalApartment(true);
  };
  const { refetch } = useQuery("detail-floor", retrieveFloor, {
    staleTime: Infinity,
  });
  return (
    <main className={mainStyles.main}>
      <div className={clsx(styles.wapper, futuna.className)}>
        <p className={clsx(utilStyles.headingXl, styles.title)}>
          Thông tin chi tiết tầng
        </p>
        <div className={styles.container}>
          <p>Thông tin cơ bản</p>
          <table className={styles.tableInfo}>
            <tr>
              <td className="col-6">
                <label className="col-2">Id:</label>{" "}
                <span className="col-10 "> {floor?.floor_id}</span>
              </td>
              <td className="col-6">
                <label className="col-2">Tên:</label>{" "}
                <span className="col-10">{floor?.name}</span>
              </td>
            </tr>
            <tr>
              <td className="col-6">
                <label className="col-2">Toàn nhà:</label>
                <span className="col-10">{" " + floor?.building_id}</span>
              </td>
              <td className="col-6">
                <label className="col-2 ">Số phòng:</label>
                <span className="col-10">{" " + floor?.max_apartment}</span>
              </td>
            </tr>
          </table>
        </div>
        <div className={styles.managerList}>
          <div className="d-flex justify-content-between align-items-end">
            <span>Danh sách phòng</span>
            <ButtonComponent
              onClick={handleShowManagerModal}
              preIcon={<AddResidentIcon width={24} height={24} />}
              className={clsx(styles.addBtn, futuna.className)}
            >
              Thêm phòng
            </ButtonComponent>
          </div>
          {floor?.apartment && floor.apartment?.length > 0 ? (
            <Table
              className={clsx(styles.tableBuilding, futuna.className)}
              striped
              bordered
              hover
            >
              <thead>
                <tr>
                  {titleTable.map((title: String, index) => (
                    <th key={index}>{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {floor.apartment.map((apartment, index): React.ReactNode => {

                  return (
                    <tr key={index}>
                      <td>{apartment.apartment_id}</td>
                      <td>{apartment.bathRooms}</td>
                      <td>{apartment.bedroom}</td>
                      <td>{apartment.description}</td>
                      <td>{apartment.name}</td>
                      <td>{apartment.rent}</td>



                      <td>
                        <div className="d-flex justify-content-center">
                          <ButtonComponent
                            onClick={() => deleleHandle(apartment.apartment_id)}
                            preIcon={<CloseIcon width={16} height={16} />}
                            className={clsx(
                              styles.cudBtn,
                              buildingStyles.deleteBtn
                            )}
                          >
                            Xóa
                          </ButtonComponent>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <p style={{ textAlign: "center", marginTop: "100px" }}>
              Chưa có phòng nào trong tầng!
            </p>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ModalComponent
        show={showModal}
        title="Có chắc chắn xóa phòng này khỏi tầng?"
        handleConfirm={() => handleConfirmDelete(selectedId)}
        setShow={setShowModal}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Modal
        dialogClassName={clsx(styles.modal, futuna.className)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showModalApartment}
        onHide={() => setShowModalApartment(false)}
      >
        <Modal.Header className={styles.modalHeader} closeButton>
          <Modal.Title className={styles.titleModal}>
            Thêm quản lí cho tòa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.bodyModal}>
          <h3 className={styles.bodyHeader}>Danh sách phòng</h3>
          <Table
            className={clsx(buildingStyles.tableBuilding, futuna.className)}
            striped
            bordered
            hover
            
          >
            <thead>
              <tr>
                <th style={{ width: 20 }}>
                  <input
                    type="checkbox"
                    checked={checkAll}
                    onChange={handleCheckAll}
                  />
                </th>
                {titleTable.map((title: String, index) => (
                  <th key={index}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apartment.map((apartment, index): React.ReactNode => {

                return (
                  <tr key={index}>
                    <td>
                      <input
                        value={apartment.apartment_id}
                        type="checkbox"
                        onChange={(e) => handleCheck(e.target.value)}
                        checked={listChecked.includes(apartment.apartment_id)}
                      />
                    </td>
                    <td>{apartment.apartment_id}</td>
                    <td>{apartment.bathRooms}</td>
                    <td>{apartment.bedroom}</td>
                    <td>{apartment.description}</td>
                    <td>{apartment.name}</td>
                    <td>{apartment.rent}</td>
                    {/* <td>{building.manager_id}</td> */}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className={styles.footerModal}>
          <ButtonComponent className={styles.saveBtn} onClick={handleSave}>
            Save
          </ButtonComponent>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default DetailFloor;
