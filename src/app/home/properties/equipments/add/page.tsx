"use client";
import {
  Button,
  Col,
  FloatingLabel,
  Form,
  FormControl,
  InputGroup,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import styles from "./addEquipment.module.css";
import { futuna } from "../../../../../../public/fonts/futura";
import DragDropFileInput from "@/components/dragDropFileInput/drapDropFileInput";
import { FaUpload } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { MouseEvent, ReactNode, useState } from "react";
import SearchLayout from "@/components/searchLayout/searchLayout";
import { Building } from "@/models/building";
import { Apartment } from "@/models/apartment";
import { useQuery } from "react-query";
import { loadingFiler, removeLoadingFilter, search } from "@/libs/utils";
import axios from "axios";
import { Resident } from "@/models/resident";
import toastMessage from "@/utils/toast";
function missingField(element: HTMLElement) {
  element.className = element.className.split("missing")[0];
  element.className += " " + styles.missing;
  element.onfocus = () => {
    element.className = element.className.split("missing")[0];
    element.onfocus = null;
  };
  console.log(element);
}
const CustomInfoModel = ({
  show,
  onHide,
  onChange,
  title,
  data,
  searchPlaceholder,
  headerField,
  onRowClick,
}: {
  show: boolean;
  onHide?: Function;
  onChange?: Function;
  onRowClick?: Function;
  title: ReactNode | string;
  data: any[];
  searchPlaceholder?: string;
  headerField: {
    title: string;
    field: string;
    preprocess?: Function;
    width?: string;
  }[];
}): ReactNode => {
  return (
    <Modal
      dialogClassName={styles.modal}
      show={show}
      style={futuna.style}
      onHide={() => {
        if (onHide) onHide();
      }}
    >
      <Modal.Header closeButton>
        {typeof title === "string" ? <Modal.Title>{title}</Modal.Title> : title}
      </Modal.Header>
      <Modal.Body>
        <div
          className={styles.itemContainer}
          style={{
            position: "absolute",
            height: "40px",
            width: "40%",
            borderStyle: "none",
            margin: 0,
            right: "5%",
          }}
        >
          <SearchLayout
            onChange={(e) => onChange}
            placeHolder={searchPlaceholder ?? ""}
          />
        </div>

        <Table style={{ width: "100%", marginTop: "50px" }} striped hover>
          <thead>
            <tr>
              {headerField.map((header, index) => (
                <th style={{ width: header.width ?? "" }} key={index}>
                  {header.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((element, index): ReactNode => {
              return (
                <tr
                  key={index}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (onRowClick) onRowClick(element);
                  }}
                >
                  {headerField.map((header, headerIndex) => {
                    let result = element[header.field as keyof typeof element];
                    if (header.preprocess)
                      result = header.preprocess(
                        element[header.field as keyof typeof element]
                      );
                    return <td key={headerIndex}>{result}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};
export default function AddEquipment() {
  const [selectedBuilding, setSelectedbuilding] = useState<
    Building | undefined
  >(undefined);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<
    Apartment | undefined
  >(undefined);
  const [selectedFiles, setSelectedFiles] = useState<(File | URL)[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [show, setShow] = useState(-1);
  const retrieveBuilding = async () => {
    try {
      loadingFiler(document.body!);
      const res = await axios.get("/api/building");
      removeLoadingFilter(document.body!);
      const buildingsData = res.data;
      setBuildings(buildingsData);
      return res.data;
    } catch (error) {
      removeLoadingFilter(document.body!);
      console.log(error);
    }
  };
  const {} = useQuery("buildings", retrieveBuilding, {
    staleTime: Infinity,
  });
  function handleFileChange(files: (File | URL)[]): void {
    setSelectedFiles(files);
  }
  const {} = useQuery(
    "apartment",
    () =>
      axios.get("/api/apartment").then((res) => {
        setApartments(res.data as Apartment[]);
      }),
    {
      refetchOnWindowFocus: false,
    }
  );
  function handleOnSelectApartment(apartment: Apartment) {
    const searchResult = search(buildings, "building_id", apartment.buildingId);
    if (searchResult.length > 0) {
      if (!selectedBuilding) {
        setSelectedbuilding(searchResult[0]);
        setSelectedApartment(apartment);
      } else {
        setSelectedApartment(apartment);
      }
      setShow(-1);
    } else
      toastMessage({
        type: "error",
        title: "Không tìm thấy tòa nhà mà căn hộ thuộc về",
      });
  }
  function onSelectBuilding(building: Building) {
    setSelectedbuilding(building);
    setShow(-1);
  }
  function validateData() {
    let flag = true;
    const name = document.getElementById("name") as HTMLInputElement;
    if (!(name && name.value)) {
      missingField(name);
      flag = false;
    }
    const status = document.getElementById("status") as HTMLSelectElement;
    if (!(status && status.value)) {
      missingField(status);
      flag = false;
    }
    if (!selectedApartment || !selectedBuilding) {
      toastMessage({
        type: "error",
        title: "Hãy nhập thông tin tòa nhà hoặc chung cư",
      });
      flag = false;
    }
    return flag;
  }
  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    loadingFiler(document.body!);
    async function addImage(data: FormData, fileList: (File | URL)[]) {
      for await (const iterator of fileList) {
        if (iterator instanceof URL) data.append("images", iterator.href);
        else data.append("images", iterator);
      }
    }
    if (!validateData()) {
      removeLoadingFilter(document.body!);
      return;
    }
    const data = new FormData();
    data.append(
      "name",
      (document.getElementById("name") as HTMLInputElement).value
    );
    data.append(
      "status",
      (document.getElementById("status") as HTMLSelectElement).value
    );
    if (selectedApartment) {
      data.append("apartment_id", selectedApartment.apartment_id);
    } else if (selectedBuilding)
      data.append("building_id", selectedBuilding.building_id);

    await addImage(data, selectedFiles).then(() => {
      axios
        .post("/api/equipment", data)
        .then((res) => {
          toastMessage({ type: "success", title: "Tạo thiết bị thành công!" });
          removeLoadingFilter(document.body!);
        })
        .catch((err) => {
          toastMessage({
            type: "error",
            title: "Có lỗi xảy ra",
          });
          removeLoadingFilter(document.body!);
        });
    });
  }

  return (
    <>
      <div className={`${styles.container} ${futuna.className}`}>
        <Form className={styles.form}>
          <Form.Label
            style={{
              textAlign: "center",
              fontSize: "3vw",
              width: "100%",
            }}
          >
            Thêm thiết bị
          </Form.Label>
          <Form.Group style={{ display: "flex", marginBottom: "1vw" }}>
            <FloatingLabel
              controlId="name"
              label="Tên thiết bị"
              style={{ display: "flex", flexGrow: "1" }}
            >
              <Form.Control type="text" placeholder="Thiết bị...." />
            </FloatingLabel>
            <FloatingLabel controlId="status" label="Tình trạng">
              <Form.Select>
                <option value={"AVAILABLE"}>Available</option>
                <option value={"NOT_AVAILABLE"}>Not available</option>
                <option value={"MAINTENANCE"}>Maintenance</option>
              </Form.Select>
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            {" "}
            <DragDropFileInput
              onChange={handleFileChange}
              id="label-file-upload"
            >
              <div
                className={styles.uploadIcon}
                style={{
                  width: "100%",
                  height: "200px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <FaUpload size={"3rem"}></FaUpload>
              </div>
            </DragDropFileInput>
          </Form.Group>
          <Form.Group>
            <Row>
              <Col>
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as={"textarea"}
                  type="text"
                  aria-multiline={true}
                  style={{ height: "10vw" }}
                />
              </Col>
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexWrap: "wrap",
                }}
              >
                <Form.Group>
                  <Form.Label>Tòa nhà</Form.Label>
                  {selectedBuilding ? (
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={selectedBuilding.building_id}
                      ></Form.Control>

                      <Button onClick={() => setSelectedbuilding(undefined)}>
                        X
                      </Button>
                    </InputGroup>
                  ) : (
                    <Form.Group>
                      <Button
                        onClick={() => setShow(0)}
                        style={{ fontSize: "1vw" }}
                      >
                        Chọn tòa nhà
                      </Button>
                    </Form.Group>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Căn hộ</Form.Label>
                  {selectedApartment ? (
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={selectedApartment?.apartment_id}
                      ></Form.Control>

                      <Button onClick={() => setSelectedApartment(undefined)}>
                        X
                      </Button>
                    </InputGroup>
                  ) : (
                    <Form.Group>
                      <Button
                        onClick={() => setShow(2)}
                        style={{ fontSize: "1vw" }}
                      >
                        Chọn căn hộ
                      </Button>
                    </Form.Group>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "2vw",
            }}
          >
            <Button onClick={handleSubmit} className={styles.creatBtn}>
              Tạo thiết bị
            </Button>
          </Form.Group>
        </Form>
      </div>
      {
        <CustomInfoModel
          show={show === 0}
          onHide={() => setShow(-1)}
          title={"Danh sách tòa nhà"}
          data={buildings}
          headerField={[
            { title: "ID", field: "building_id" },
            { title: "Tên tòa nhà", field: "name" },
            { title: "Địa chỉ", field: "address" },
          ]}
          onRowClick={onSelectBuilding}
        />
      }
      {
        <CustomInfoModel
          show={show === 2}
          onHide={() => setShow(-1)}
          title={"Danh sách apartment"}
          data={
            selectedBuilding
              ? search(apartments, "buildingId", selectedBuilding.building_id)
              : apartments
          }
          headerField={[
            { title: "ID", field: "apartment_id" },
            { title: "Tên tòa nhà", field: "name" },
            { title: "Trạng thái", field: "status" },
            {
              title: "Cư dân hiện tại",
              field: "status",
              preprocess: (residents: Resident[]): string => {
                if (residents && residents.length > 0) return residents[0].id;
                else return "NONE";
              },
            },
          ]}
          onRowClick={handleOnSelectApartment}
        />
      }
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
    </>
  );
}
