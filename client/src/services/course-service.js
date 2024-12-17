import axios from "axios";
const API_URL = "http://localhost:8080/api/courses";

class CourseService {
  getToken() {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return token;
  }

  post(title, description, price) {
    return axios.post(
      API_URL,
      {
        title,
        description,
        price,
      },
      {
        headers: {
          Authorization: this.getToken(),
        },
      }
    );
  }
  //用 student id 找學生有註冊的課程
  getEnrolledCourses(_id) {
    return axios.get(API_URL + "/student/" + _id, {
      headers: {
        Authorization: this.getToken(),
      },
    });
  }

  //用 course name 找課程
  getCourseByName(name) {
    return axios.get(API_URL + "/findByName/" + name, {
      headers: {
        Authorization: this.getToken(),
      },
    });
  }

  //用 instructor id 找老師有的課程
  get(_id) {
    return axios.get(API_URL + "/instructor/" + _id, {
      headers: {
        Authorization: this.getToken(),
      },
    });
  }

  //用 course id 註冊課程
  enroll(_id) {
    return axios.post(
      API_URL + "/enroll/" + _id,
      {},
      {
        headers: {
          Authorization: this.getToken(),
        },
      }
    );
  }
}

export default new CourseService();
